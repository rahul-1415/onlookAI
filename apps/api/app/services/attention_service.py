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

        # Weighted scoring per event type
        negative_weights = {
            AttentionEventType.TAB_HIDDEN: 20,
            AttentionEventType.WINDOW_BLUR: 20,
            AttentionEventType.IDLE: 20,
            AttentionEventType.NO_FACE: 25,  # Higher penalty — physically absent
        }

        positive_weights = {
            AttentionEventType.TAB_VISIBLE: 10,
            AttentionEventType.WINDOW_FOCUS: 10,
            AttentionEventType.ACTIVITY_RESUMED: 10,
            AttentionEventType.FACE_DETECTED: 10,
        }

        for event in events:
            penalty = negative_weights.get(event.event_type)
            if penalty is not None:
                score -= penalty
            else:
                bonus = positive_weights.get(event.event_type)
                if bonus is not None:
                    score += bonus

        # Clamp to [0, 100]
        score = max(0.0, min(100.0, score))

        logger.debug(f"Attention score for session {session_id}: {score}")
        return score

