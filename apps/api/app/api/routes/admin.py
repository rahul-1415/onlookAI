from fastapi import APIRouter, File, UploadFile

from app.schemas.common import ScaffoldResponse
from app.schemas.content import CourseCreateRequest

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/videos/upload", response_model=ScaffoldResponse)
async def upload_video(file: UploadFile = File(...)) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="admin.videos.upload",
        next_step=f"Implement file storage and metadata persistence for {file.filename}.",
    )


@router.post("/videos/{video_id}/transcript", response_model=ScaffoldResponse)
async def upload_transcript(video_id: str, file: UploadFile = File(...)) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="admin.videos.transcript",
        next_step=f"Attach transcript {file.filename} to video {video_id}.",
    )


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

