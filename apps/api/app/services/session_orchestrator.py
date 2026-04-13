import json
import logging
from uuid import uuid4

from sqlalchemy.orm import Session

from app.agents.answer_evaluation import AnswerEvaluationAgent
from app.agents.question_generation import QuestionGenerationAgent
from app.models import (
    AttentionEvent,
    Intervention,
    InterventionAnswer,
    TrainingSession,
    VideoAsset,
)
from app.schemas.session import AttentionEventCreate, InterventionAnswerCreate
from app.services.attention_service import AttentionMonitoringService
from app.utils.enums import InterventionStatus, SessionStatus

logger = logging.getLogger("onlook")


class SessionOrchestratorService:
    @staticmethod
    async def ingest_attention_event(
        session_id: str, payload: AttentionEventCreate, db: Session
    ) -> dict:
        """
        Ingest an attention event, calculate score, and trigger intervention if needed.

        Returns: {score, status, intervention (optional)}
        """
        # Save the attention event
        event = AttentionEvent(
            id=str(uuid4()),
            session_id=session_id,
            event_type=payload.event_type,
            value=payload.value,
            timestamp=payload.occurred_at,
            metadata_json=payload.metadata,
        )
        db.add(event)
        db.flush()

        # Calculate attention score
        score = await AttentionMonitoringService.calculate_score(session_id, db)

        # Fetch session to check status and get video info
        session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
        if not session:
            db.rollback()
            raise ValueError(f"Session {session_id} not found")

        # Check if intervention should be triggered (score < 40 and no open intervention)
        intervention_response = None
        if score < 40:
            existing_intervention = (
                db.query(Intervention)
                .filter(
                    Intervention.session_id == session_id,
                    Intervention.status == InterventionStatus.OPEN,
                )
                .first()
            )

            if not existing_intervention:
                try:
                    # Fetch video details for question generation
                    video = (
                        db.query(VideoAsset)
                        .filter(VideoAsset.id == session.video_asset_id)
                        .first()
                    )
                    video_title = video.title if video else "Training Video"

                    # Generate question via agent
                    question_agent = QuestionGenerationAgent()
                    question_payload = await question_agent.run(
                        {
                            "session_id": session_id,
                            "video_asset_id": session.video_asset_id,
                            "video_title": video_title,
                            "video_position_sec": 0,  # Could track actual position
                        },
                        db=db,
                    )

                    # Create intervention record
                    intervention = Intervention(
                        id=str(uuid4()),
                        session_id=session_id,
                        trigger_timestamp=payload.occurred_at,
                        trigger_reason=f"Low attention score: {score:.1f}",
                        attention_score=score,
                        question_json=question_payload,
                        status=InterventionStatus.OPEN,
                        resolved_at="",
                    )
                    db.add(intervention)
                    db.flush()

                    # Update session status
                    session.status = SessionStatus.INTERRUPTED
                    session.intervention_count += 1

                    intervention_response = {
                        "id": intervention.id,
                        "question_json": intervention.question_json,
                        "status": intervention.status,
                    }

                    logger.info(
                        f"Triggered intervention for session {session_id} at score {score}"
                    )

                except Exception as e:
                    logger.error(f"Failed to generate intervention: {e}")
                    db.rollback()
                    raise

        db.commit()

        return {
            "score": score,
            "session_status": session.status,
            "intervention": intervention_response,
        }

    @staticmethod
    async def answer_intervention(
        session_id: str, intervention_id: str, payload: InterventionAnswerCreate, db: Session
    ) -> dict:
        """
        Handle intervention answer: evaluate and return next action.

        Returns: {is_correct, feedback, next_action, intervention_status}
        """
        # Fetch intervention
        intervention = (
            db.query(Intervention)
            .filter(Intervention.id == intervention_id, Intervention.session_id == session_id)
            .first()
        )
        if not intervention:
            raise ValueError(f"Intervention {intervention_id} not found")

        # Evaluate answer via agent
        evaluation_agent = AnswerEvaluationAgent()
        evaluation = await evaluation_agent.run(
            {
                "question": intervention.question_json.get("question", ""),
                "options": intervention.question_json.get("options", []),
                "correct_index": intervention.question_json.get("correct_index", 0),
                "user_answer": payload.user_answer,
            }
        )

        # Save intervention answer
        answer = InterventionAnswer(
            id=str(uuid4()),
            intervention_id=intervention_id,
            user_answer=payload.user_answer,
            evaluation_json=evaluation,
            submitted_at=payload.submitted_at if hasattr(payload, "submitted_at") else "",
        )
        db.add(answer)
        db.flush()

        # Update intervention status
        if evaluation.get("is_correct"):
            intervention.status = InterventionStatus.PASSED
            # Resume video
            session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
            if session:
                session.status = SessionStatus.PLAYING
        else:
            intervention.status = InterventionStatus.FAILED

        intervention.resolved_at = answer.submitted_at

        db.commit()

        return {
            "is_correct": evaluation.get("is_correct"),
            "feedback": evaluation.get("feedback", ""),
            "next_action": evaluation.get("next_action", "resume"),
            "intervention_status": intervention.status,
        }

    @staticmethod
    async def start_session(self) -> None:
        raise NotImplementedError("Implement session start orchestration.")

