from sqlalchemy import Boolean, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class XAPIEvent(Base):
    __tablename__ = "xapi_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), nullable=False)
    statement_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    sent_to_lrs: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[str] = mapped_column(String(64), default="", nullable=False)

