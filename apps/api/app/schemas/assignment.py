from datetime import datetime
from pydantic import BaseModel

from app.utils.enums import AssignmentStatus


class VideoDetail(BaseModel):
    id: str
    title: str
    description: str
    duration_sec: int
    storage_url: str


class CourseDetail(BaseModel):
    id: str
    title: str
    description: str
    videos: list[VideoDetail]


class AssignmentResponse(BaseModel):
    id: str
    course: CourseDetail
    status: AssignmentStatus
    due_at: datetime | None
    assigned_at: datetime | None
    completed_at: datetime | None


class AssignmentsListResponse(BaseModel):
    assignments: list[AssignmentResponse]
