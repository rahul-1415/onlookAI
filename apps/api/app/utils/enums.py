from enum import StrEnum


class UserRole(StrEnum):
    LEARNER = "learner"
    COMPLIANCE_ADMIN = "compliance_admin"
    ORG_ADMIN = "org_admin"


class AssignmentStatus(StrEnum):
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoAssetStatus(StrEnum):
    PROCESSING = "processing"
    READY = "ready"
    PUBLISHED = "published"


class SessionStatus(StrEnum):
    IDLE = "idle"
    READY = "ready"
    PLAYING = "playing"
    WARNING = "warning"
    INTERRUPTED = "interrupted"
    ANSWERING = "answering"
    RESUMING = "resuming"
    QUIZ = "quiz"
    COMPLETED = "completed"
    FAILED = "failed"


class AttentionEventType(StrEnum):
    TAB_HIDDEN = "tab_hidden"
    TAB_VISIBLE = "tab_visible"
    WINDOW_BLUR = "window_blur"
    WINDOW_FOCUS = "window_focus"
    IDLE = "idle"
    ACTIVITY_RESUMED = "activity_resumed"
    PLAYBACK_PAUSED = "playback_paused"
    PLAYBACK_RESUMED = "playback_resumed"
    WARNING = "warning"
    NO_FACE = "no_face"


class InterventionStatus(StrEnum):
    OPEN = "open"
    PASSED = "passed"
    FAILED = "failed"
    ABANDONED = "abandoned"

