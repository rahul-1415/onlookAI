from pydantic import BaseModel, Field

from app.utils.enums import AttentionEventType, SessionStatus


class StartSessionRequest(BaseModel):
    assignment_id: str
    video_asset_id: str


class SessionResponse(BaseModel):
    id: str
    assignment_id: str
    video_asset_id: str
    status: SessionStatus
    started_at: str | None = None
    ended_at: str | None = None


class AttentionEventCreate(BaseModel):
    event_type: AttentionEventType
    occurred_at: str
    value: float | None = None
    metadata: dict[str, object] = Field(default_factory=dict)


class InterventionAnswerCreate(BaseModel):
    user_answer: str


class InterventionDetail(BaseModel):
    id: str
    question_json: dict
    status: str


class AttentionEventResponse(BaseModel):
    score: float
    session_status: str
    intervention: InterventionDetail | None = None


class AnswerEvaluationResponse(BaseModel):
    is_correct: bool
    feedback: str
    next_action: str
    intervention_status: str


class LearnerDashboardResponse(BaseModel):
    total_assignments: int
    completed_assignments: int
    in_progress_assignments: int
    avg_attention_score: float | None
    total_interventions: int
    passed_interventions: int


class SessionCompletionResponse(BaseModel):
    session: SessionResponse
    final_score: float
    total_events: int
    interventions_triggered: int
    interventions_passed: int
    duration_seconds: float


class TimelineEvent(BaseModel):
    type: str  # "attention" or "intervention"
    timestamp: str
    event_type: str | None = None
    score: float | None = None
    intervention_status: str | None = None
    question_text: str | None = None


class SessionTimelineResponse(BaseModel):
    session_id: str
    events: list[TimelineEvent]
