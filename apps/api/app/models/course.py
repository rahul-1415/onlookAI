from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Course(TimestampMixin, Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    policy_id: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

