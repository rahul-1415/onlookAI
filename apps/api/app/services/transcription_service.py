import logging
from pathlib import Path
from uuid import uuid4

from faster_whisper import WhisperModel
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import TranscriptChunk, VideoAsset
from app.utils.enums import VideoAssetStatus

logger = logging.getLogger("onlook")

# Module-level singleton — model loads once, reused across requests
_whisper_model: WhisperModel | None = None


def _get_whisper_model() -> WhisperModel:
    global _whisper_model
    if _whisper_model is None:
        settings = get_settings()
        logger.info(
            f"Loading Whisper model '{settings.whisper_model_size}' "
            f"on device '{settings.whisper_device}' (first load downloads ~140MB)..."
        )
        _whisper_model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type="int8",
        )
        logger.info("Whisper model loaded successfully")
    return _whisper_model


class TranscriptionService:
    @staticmethod
    async def transcribe_video(video_asset_id: str, db: Session) -> list[dict]:
        """
        Run local Whisper transcription on a video file.

        Reads the video from storage, extracts audio via ffmpeg (handled
        internally by faster-whisper), and populates TranscriptChunk rows
        with timestamped segments.

        Returns list of created chunk dicts.
        """
        video = db.query(VideoAsset).filter(VideoAsset.id == video_asset_id).first()
        if not video:
            raise ValueError(f"VideoAsset {video_asset_id} not found")

        # Resolve the video file path
        video_path = Path(video.storage_url)
        if not video_path.is_absolute():
            video_path = Path(get_settings().local_storage_root).resolve() / video.storage_url

        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        # Run Whisper transcription
        model = _get_whisper_model()
        segments, info = model.transcribe(str(video_path), beam_size=5)

        # Delete existing chunks for idempotent re-runs
        db.query(TranscriptChunk).filter(
            TranscriptChunk.video_asset_id == video_asset_id
        ).delete()

        created_chunks = []
        for segment in segments:
            chunk = TranscriptChunk(
                id=str(uuid4()),
                video_asset_id=video_asset_id,
                start_sec=int(segment.start),
                end_sec=int(segment.end),
                text=segment.text.strip(),
                embedding_status="pending",
            )
            db.add(chunk)
            created_chunks.append({
                "id": chunk.id,
                "start_sec": chunk.start_sec,
                "end_sec": chunk.end_sec,
                "text": chunk.text,
            })

        # Update video metadata
        video.duration_sec = int(info.duration)
        video.status = VideoAssetStatus.READY

        db.commit()
        logger.info(
            f"Transcribed video {video_asset_id}: {len(created_chunks)} chunks, "
            f"{info.duration:.0f}s duration"
        )
        return created_chunks
