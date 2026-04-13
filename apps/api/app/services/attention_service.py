import logging

from sqlalchemy.orm import Session

from app.models import AttentionEvent
from app.utils.enums import AttentionEventType

logger = logging.getLogger("onlook")


class AttentionMonitoringService:
    @staticmethod
    async def calculate_score(session_id: str, db: Session) -> float:
        """
        Calculate rolling attention score for a session.

        Scoring algorithm:
        - Start at 100
        - Negative events (tab_hidden, window_blur, idle): -20 each
        - Positive events (tab_visible, window_focus, activity_resumed): +10 each
        - Clamp to [0, 100]

        Returns: float between 0 and 100
        """
        # Fetch last 10 events for this session
        events = (
            db.query(AttentionEvent)
            .filter(AttentionEvent.session_id == session_id)
            .order_by(AttentionEvent.id.desc())
            .limit(10)
            .all()
        )

        if not events:
            return 100.0  # Full attention if no events yet

        score = 100.0

        # Negative events
        negative_events = {
            AttentionEventType.TAB_HIDDEN,
            AttentionEventType.WINDOW_BLUR,
            AttentionEventType.IDLE,
        }

        # Positive events
        positive_events = {
            AttentionEventType.TAB_VISIBLE,
            AttentionEventType.WINDOW_FOCUS,
            AttentionEventType.ACTIVITY_RESUMED,
        }

        for event in events:
            if event.event_type in negative_events:
                score -= 20
            elif event.event_type in positive_events:
                score += 10

        # Clamp to [0, 100]
        score = max(0.0, min(100.0, score))

        logger.debug(f"Attention score for session {session_id}: {score}")
        return score

