from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import get_current_user, get_db
from app.integrations.storage.local import LocalStorageAdapter
from app.models import User, VideoAsset
from app.schemas.common import ScaffoldResponse
from app.schemas.content import CourseCreateRequest
from app.services.transcription_service import TranscriptionService
from app.utils.enums import VideoAssetStatus
from sqlalchemy.orm import Session

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/videos/upload")
async def upload_video(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a video file and create a VideoAsset record."""
    video_id = str(uuid4())
    extension = Path(file.filename).suffix if file.filename else ".mp4"
    storage_key = f"videos/{video_id}{extension}"

    adapter = LocalStorageAdapter()
    content = await file.read()
    saved_path = await adapter.save(storage_key, content)

    video = VideoAsset(
        id=video_id,
        org_id=current_user.org_id,
        title=title,
        storage_url=saved_path,
        status=VideoAssetStatus.PROCESSING,
        created_by=current_user.id,
    )
    db.add(video)
    db.commit()

    return {"id": video_id, "status": "processing", "storage_url": saved_path}


@router.post("/videos/{video_id}/transcribe")
async def transcribe_video(
    video_id: str,
    db: Session = Depends(get_db),
):
    """Run local Whisper transcription on an uploaded video."""
    chunks = await TranscriptionService.transcribe_video(video_id, db)
    return {
        "video_id": video_id,
        "chunks_created": len(chunks),
        "chunks": chunks,
    }


@router.post("/videos/upload-and-transcribe")
async def upload_and_transcribe(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a video and immediately transcribe it with Whisper."""
    # Upload
    video_id = str(uuid4())
    extension = Path(file.filename).suffix if file.filename else ".mp4"
    storage_key = f"videos/{video_id}{extension}"

    adapter = LocalStorageAdapter()
    content = await file.read()
    saved_path = await adapter.save(storage_key, content)

    video = VideoAsset(
        id=video_id,
        org_id=current_user.org_id,
        title=title,
        storage_url=saved_path,
        status=VideoAssetStatus.PROCESSING,
        created_by=current_user.id,
    )
    db.add(video)
    db.flush()

    # Transcribe
    chunks = await TranscriptionService.transcribe_video(video_id, db)

    return {
        "id": video_id,
        "status": "ready",
        "storage_url": saved_path,
        "chunks_created": len(chunks),
        "chunks": chunks,
    }


@router.post("/videos/{video_id}/publish", response_model=ScaffoldResponse)
async def publish_video(video_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="admin.videos.publish",
        next_step=f"Validate processing state and publish video {video_id}.",
    )


@router.post("/courses", response_model=ScaffoldResponse)
async def create_course(payload: CourseCreateRequest) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="admin.courses.create",
        next_step=f"Persist course scaffold for {payload.title}.",
    )


@router.post("/courses/{course_id}/assign", response_model=ScaffoldResponse)
async def assign_course(course_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="admin.courses.assign",
        next_step=f"Implement assignment workflow for course {course_id}.",
    )
