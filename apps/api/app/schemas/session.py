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
