from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, get_current_user
from app.models import Assignment, Course, CourseVideo, TrainingSession, VideoAsset, User
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
)
from app.utils.enums import SessionStatus

router = APIRouter(tags=["learner"])


@router.get("/assignments", response_model=AssignmentsListResponse)
async def list_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AssignmentsListResponse:
    # Query all assignments for the current user
    assignments = (
        db.query(Assignment)
        .filter(Assignment.user_id == current_user.id)
        .all()
    )

    assignments_response = []
    for assignment in assignments:
        # Get the course
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        if not course:
            continue

        # Get all videos for this course
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

        assignments_response.append(
            AssignmentResponse(
                id=assignment.id,
                course=course_detail,
                status=assignment.status,
                due_at=assignment.due_at,
                assigned_at=assignment.assigned_at,
                completed_at=assignment.completed_at,
            )
        )

    return AssignmentsListResponse(assignments=assignments_response)


@router.post("/sessions/start", response_model=SessionResponse)
async def start_session(
    payload: StartSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionResponse:
    # Verify the assignment exists and belongs to the user
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

    # Verify the video asset exists
    video = db.query(VideoAsset).filter(VideoAsset.id == payload.video_asset_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video asset not found",
        )

    # Create a new session
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


@router.post("/sessions/{session_id}/heartbeat", response_model=ScaffoldResponse)
async def session_heartbeat(session_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.heartbeat",
        next_step=f"Implement heartbeat intake for session {session_id}.",
    )


@router.post("/sessions/{session_id}/attention-event", response_model=ScaffoldResponse)
async def post_attention_event(
    session_id: str, payload: AttentionEventCreate
) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.attention_event",
        next_step=(
            "Feed the session orchestrator with "
            f"{payload.event_type} for session {session_id}."
        ),
    )


@router.post(
    "/sessions/{session_id}/intervention/{intervention_id}/answer",
    response_model=ScaffoldResponse,
)
async def answer_intervention(
    session_id: str, intervention_id: str, payload: InterventionAnswerCreate
) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.intervention_answer",
        next_step=(
            "Evaluate learner answer for "
            f"intervention {intervention_id} in session {session_id}: {payload.user_answer}"
        ),
    )


@router.post("/sessions/{session_id}/complete", response_model=ScaffoldResponse)
async def complete_session(session_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.complete",
        next_step=f"Finalize scores and evidence for session {session_id}.",
    )

