from pydantic import BaseModel, Field

from app.utils.enums import AttentionEventType


class StartSessionRequest(BaseModel):
    assignment_id: str
    video_asset_id: str


class AttentionEventCreate(BaseModel):
    event_type: AttentionEventType
    occurred_at: str
    value: float | None = None
    metadata: dict[str, object] = Field(default_factory=dict)


class InterventionAnswerCreate(BaseModel):
    user_answer: str
