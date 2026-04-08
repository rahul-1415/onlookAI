from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InterventionAnswer(Base):
    __tablename__ = "intervention_answers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    intervention_id: Mapped[str] = mapped_column(
        ForeignKey("interventions.id"), nullable=False
    )
    user_answer: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    submitted_at: Mapped[str] = mapped_column(String(64), nullable=False)

