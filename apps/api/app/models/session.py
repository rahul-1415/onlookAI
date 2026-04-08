from datetime import datetime

from sqlalchemy import DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.utils.enums import SessionStatus


class TrainingSession(TimestampMixin, Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    assignment_id: Mapped[str] = mapped_column(ForeignKey("assignments.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    video_asset_id: Mapped[str] = mapped_column(ForeignKey("video_assets.id"), nullable=False)
    status: Mapped[SessionStatus] = mapped_column(
        SqlEnum(SessionStatus), default=SessionStatus.IDLE, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    avg_attention_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    intervention_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    final_score: Mapped[float | None] = mapped_column(Float, nullable=True)
