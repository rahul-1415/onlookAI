from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, get_current_user
from app.models import (
    Assignment, AttentionEvent, Course, CourseVideo,
    Intervention, TrainingSession, VideoAsset, User,
)
from app.schemas.assignment import (
    AssignmentsListResponse,
    AssignmentResponse,
    CourseDetail,
    VideoDetail,
)
from app.schemas.common import ScaffoldResponse
from app.schemas.session import (
    AttentionEventCreate,
    InterventionAnswerCreate,
    SessionResponse,
    StartSessionRequest,
    AttentionEventResponse,
    AnswerEvaluationResponse,
    LearnerDashboardResponse,
    SessionCompletionResponse,
    SessionTimelineResponse,
    TimelineEvent,
)
from app.services.attention_service import AttentionMonitoringService
from app.services.session_orchestrator import SessionOrchestratorService
from app.utils.enums import AssignmentStatus, InterventionStatus, SessionStatus

router = APIRouter(tags=["learner"])


# ── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=LearnerDashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LearnerDashboardResponse:
    assignments = (
        db.query(Assignment)
        .filter(Assignment.user_id == current_user.id)
        .all()
    )

    total = len(assignments)
    completed = sum(1 for a in assignments if a.status == AssignmentStatus.COMPLETED)
    in_progress = sum(1 for a in assignments if a.status == AssignmentStatus.IN_PROGRESS)

    # Average attention score across completed sessions
    completed_sessions = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.user_id == current_user.id,
            TrainingSession.status == SessionStatus.COMPLETED,
        )
        .all()
    )

    avg_score = None
    if completed_sessions:
        scores = []
        for s in completed_sessions:
            score = await AttentionMonitoringService.calculate_score(s.id, db)
            scores.append(score)
        avg_score = round(sum(scores) / len(scores), 1) if scores else None

    # Intervention stats
    user_session_ids = [s.id for s in completed_sessions]
    total_interventions = 0
    passed_interventions = 0
    if user_session_ids:
        interventions = (
            db.query(Intervention)
            .filter(Intervention.session_id.in_(user_session_ids))
            .all()
        )
        total_interventions = len(interventions)
        passed_interventions = sum(
            1 for i in interventions if i.status == InterventionStatus.PASSED
        )

    return LearnerDashboardResponse(
        total_assignments=total,
        completed_assignments=completed,
        in_progress_assignments=in_progress,
        avg_attention_score=avg_score,
        total_interventions=total_interventions,
        passed_interventions=passed_interventions,
    )


# ── Assignments ──────────────────────────────────────────────────────────────

@router.get("/assignments", response_model=AssignmentsListResponse)
async def list_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AssignmentsListResponse:
    assignments = (
        db.query(Assignment)
        .filter(Assignment.user_id == current_user.id)
        .all()
    )

    assignments_response = []
    for assignment in assignments:
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        if not course:
            continue

        course_videos = (
            db.query(CourseVideo)
            .filter(CourseVideo.course_id == course.id)
            .order_by(CourseVideo.sort_order)
            .all()
        )

        videos = []
        for cv in course_videos:
            video_asset = (
                db.query(VideoAsset)
                .filter(VideoAsset.id == cv.video_asset_id)
                .first()
            )
            if video_asset:
                videos.append(
                    VideoDetail(
                        id=video_asset.id,
                        title=video_asset.title,
                        description=video_asset.description,
                        duration_sec=video_asset.duration_sec,
                        storage_url=video_asset.storage_url,
                    )
                )

        course_detail = CourseDetail(
            id=course.id,
            title=course.title,
            description=course.description,
            videos=videos,
        )

        # B4: Get last session for this assignment
        last_session = (
            db.query(TrainingSession)
            .filter(TrainingSession.assignment_id == assignment.id)
            .order_by(TrainingSession.started_at.desc())
            .first()
        )

        assignments_response.append(
            AssignmentResponse(
                id=assignment.id,
                course=course_detail,
                status=assignment.status,
                due_at=assignment.due_at,
                assigned_at=assignment.assigned_at,
                completed_at=assignment.completed_at,
                last_session_id=last_session.id if last_session else None,
                last_session_status=last_session.status if last_session else None,
                last_session_at=(
                    last_session.started_at.isoformat()
                    if last_session and last_session.started_at
                    else None
                ),
            )
        )

    return AssignmentsListResponse(assignments=assignments_response)


# ── Sessions ─────────────────────────────────────────────────────────────────

@router.post("/sessions/start", response_model=SessionResponse)
async def start_session(
    payload: StartSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionResponse:
    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == payload.assignment_id,
            Assignment.user_id == current_user.id,
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found",
        )

    video = db.query(VideoAsset).filter(VideoAsset.id == payload.video_asset_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video asset not found",
        )

    session_id = str(uuid4())
    session = TrainingSession(
        id=session_id,
        assignment_id=payload.assignment_id,
        user_id=current_user.id,
        video_asset_id=payload.video_asset_id,
        status=SessionStatus.READY,
        started_at=datetime.utcnow(),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        id=session.id,
        assignment_id=session.assignment_id,
        video_asset_id=session.video_asset_id,
        status=session.status,
        started_at=session.started_at.isoformat() if session.started_at else None,
        ended_at=session.ended_at.isoformat() if session.ended_at else None,
    )


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch session details with video information for the frontend."""
    session = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    video = (
        db.query(VideoAsset)
        .filter(VideoAsset.id == session.video_asset_id)
        .first()
    )

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    return {
        "session": SessionResponse(
            id=session.id,
            assignment_id=session.assignment_id,
            video_asset_id=session.video_asset_id,
            status=session.status,
            started_at=session.started_at.isoformat() if session.started_at else None,
            ended_at=session.ended_at.isoformat() if session.ended_at else None,
        ),
        "storage_url": video.storage_url,
        "video_title": video.title,
    }


@router.post("/sessions/{session_id}/heartbeat", response_model=ScaffoldResponse)
async def session_heartbeat(session_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.heartbeat",
        next_step=f"Implement heartbeat intake for session {session_id}.",
    )


@router.post("/sessions/{session_id}/attention-event", response_model=AttentionEventResponse)
async def post_attention_event(
    session_id: str,
    payload: AttentionEventCreate,
    db: Session = Depends(get_db),
) -> AttentionEventResponse:
    return await SessionOrchestratorService.ingest_attention_event(
        session_id, payload, db
    )


@router.post(
    "/sessions/{session_id}/intervention/{intervention_id}/answer",
    response_model=AnswerEvaluationResponse,
)
async def answer_intervention(
    session_id: str,
    intervention_id: str,
    payload: InterventionAnswerCreate,
    db: Session = Depends(get_db),
) -> AnswerEvaluationResponse:
    return await SessionOrchestratorService.answer_intervention(
        session_id, intervention_id, payload, db
    )


# ── Session completion (B2: enhanced response) ──────────────────────────────

@router.post("/sessions/{session_id}/complete", response_model=SessionCompletionResponse)
async def complete_session(
    session_id: str,
    db: Session = Depends(get_db),
) -> SessionCompletionResponse:
    session = (
        db.query(TrainingSession)
        .filter(TrainingSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    session.status = SessionStatus.COMPLETED
    session.ended_at = datetime.utcnow()

    # Calculate final stats
    final_score = await AttentionMonitoringService.calculate_score(session_id, db)
    session.final_score = final_score

    total_events = (
        db.query(AttentionEvent)
        .filter(AttentionEvent.session_id == session_id)
        .count()
    )

    interventions = (
        db.query(Intervention)
        .filter(Intervention.session_id == session_id)
        .all()
    )
    interventions_triggered = len(interventions)
    interventions_passed = sum(
        1 for i in interventions if i.status == InterventionStatus.PASSED
    )

    duration_seconds = 0.0
    if session.started_at and session.ended_at:
        duration_seconds = (session.ended_at - session.started_at).total_seconds()

    db.commit()
    db.refresh(session)

    session_resp = SessionResponse(
        id=session.id,
        assignment_id=session.assignment_id,
        video_asset_id=session.video_asset_id,
        status=session.status,
        started_at=session.started_at.isoformat() if session.started_at else None,
        ended_at=session.ended_at.isoformat() if session.ended_at else None,
    )

    return SessionCompletionResponse(
        session=session_resp,
        final_score=final_score,
        total_events=total_events,
        interventions_triggered=interventions_triggered,
        interventions_passed=interventions_passed,
        duration_seconds=duration_seconds,
    )


# ── Session timeline (B3) ───────────────────────────────────────────────────

@router.get("/sessions/{session_id}/timeline", response_model=SessionTimelineResponse)
async def get_session_timeline(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionTimelineResponse:
    session = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Gather attention events
    attention_events = (
        db.query(AttentionEvent)
        .filter(AttentionEvent.session_id == session_id)
        .all()
    )

    # Gather interventions
    interventions = (
        db.query(Intervention)
        .filter(Intervention.session_id == session_id)
        .all()
    )

    events: list[TimelineEvent] = []

    for ae in attention_events:
        events.append(TimelineEvent(
            type="attention",
            timestamp=ae.timestamp,
            event_type=ae.event_type,
        ))

    for iv in interventions:
        question_text = None
        q = iv.question_json
        if isinstance(q, dict):
            question_text = q.get("question", q.get("text"))
        events.append(TimelineEvent(
            type="intervention",
            timestamp=iv.trigger_timestamp,
            intervention_status=iv.status,
            question_text=question_text,
            score=iv.attention_score,
        ))

    # Sort by timestamp
    events.sort(key=lambda e: e.timestamp)

    return SessionTimelineResponse(
        session_id=session_id,
        events=events,
    )
