from sqlalchemy import Enum as SqlEnum, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.enums import InterventionStatus


class Intervention(Base):
    __tablename__ = "interventions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), nullable=False)
    trigger_timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    trigger_reason: Mapped[str] = mapped_column(String(255), nullable=False)
    attention_score: Mapped[float] = mapped_column(Float, nullable=False)
    question_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[InterventionStatus] = mapped_column(
        SqlEnum(InterventionStatus), default=InterventionStatus.OPEN, nullable=False
    )
    resolved_at: Mapped[str] = mapped_column(String(64), default="", nullable=False)

