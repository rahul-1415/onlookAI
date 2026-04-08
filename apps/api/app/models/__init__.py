from app.models.assignment import Assignment
from app.models.attention_event import AttentionEvent
from app.models.audit_log import AuditLog
from app.models.course import Course
from app.models.course_video import CourseVideo
from app.models.final_quiz_result import FinalQuizResult
from app.models.intervention import Intervention
from app.models.intervention_answer import InterventionAnswer
from app.models.organization import Organization
from app.models.session import TrainingSession
from app.models.transcript_chunk import TranscriptChunk
from app.models.user import User
from app.models.video_asset import VideoAsset
from app.models.xapi_event import XAPIEvent

all_models = [
    Assignment,
    AttentionEvent,
    AuditLog,
    Course,
    CourseVideo,
    FinalQuizResult,
    Intervention,
    InterventionAnswer,
    Organization,
    TrainingSession,
    TranscriptChunk,
    User,
    VideoAsset,
    XAPIEvent,
]

