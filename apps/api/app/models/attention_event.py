from sqlalchemy import Enum as SqlEnum, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.enums import AttentionEventType


class AttentionEvent(Base):
    __tablename__ = "attention_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), nullable=False)
    event_type: Mapped[AttentionEventType] = mapped_column(
        SqlEnum(AttentionEventType), nullable=False
    )
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

