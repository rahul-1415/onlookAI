from sqlalchemy import Boolean, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class FinalQuizResult(TimestampMixin, Base):
    __tablename__ = "final_quiz_results"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    details_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

