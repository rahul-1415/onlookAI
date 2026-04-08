from fastapi import APIRouter

from app.schemas.common import ScaffoldResponse
from app.schemas.session import (
    AttentionEventCreate,
    InterventionAnswerCreate,
    StartSessionRequest,
)

router = APIRouter(tags=["learner"])


@router.get("/assignments", response_model=ScaffoldResponse)
async def list_assignments() -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.assignments.list",
        next_step="Implement learner assignment query and dashboard summaries.",
    )


@router.post("/sessions/start", response_model=ScaffoldResponse)
async def start_session(payload: StartSessionRequest) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="learner.sessions.start",
        next_step=(
            "Create session record and initial state for assignment "
            f"{payload.assignment_id}."
        ),
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

