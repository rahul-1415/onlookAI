from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class CourseVideo(TimestampMixin, Base):
    __tablename__ = "course_videos"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id"), nullable=False)
    video_asset_id: Mapped[str] = mapped_column(ForeignKey("video_assets.id"), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

