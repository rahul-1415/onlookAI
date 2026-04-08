from sqlalchemy import Enum as SqlEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.utils.enums import VideoAssetStatus


class VideoAsset(TimestampMixin, Base):
    __tablename__ = "video_assets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    storage_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    duration_sec: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    transcript_url: Mapped[str] = mapped_column(String(1024), default="", nullable=False)
    status: Mapped[VideoAssetStatus] = mapped_column(
        SqlEnum(VideoAssetStatus),
        default=VideoAssetStatus.PROCESSING,
        nullable=False,
    )
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

