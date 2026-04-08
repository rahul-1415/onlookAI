from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class TranscriptChunk(TimestampMixin, Base):
    __tablename__ = "transcript_chunks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_asset_id: Mapped[str] = mapped_column(
        ForeignKey("video_assets.id"), nullable=False
    )
    start_sec: Mapped[int] = mapped_column(Integer, nullable=False)
    end_sec: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding_status: Mapped[str] = mapped_column(String(64), default="pending", nullable=False)

