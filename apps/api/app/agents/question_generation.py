import json
import logging

from sqlalchemy.orm import Session

from app.agents.base import AgentAdapter
from app.agents.prompts import build_question_prompt
from app.core.config import get_settings
from app.integrations.ai.openai_compatible import OpenAICompatibleProvider
from app.models import TranscriptChunk

logger = logging.getLogger("onlook")


class QuestionGenerationAgent(AgentAdapter):
    async def run(self, payload: dict, db: Session | None = None) -> dict:
        """
        Generate a question based on video transcript.

        Payload should contain:
        - session_id: str
        - video_asset_id: str
        - video_title: str
        - video_position_sec: float (optional, default 0)
        - db: Session (optional, for transcript lookup)
        """
        video_asset_id = payload.get("video_asset_id", "")
        video_title = payload.get("video_title", "Video Training")
        video_position_sec = payload.get("video_position_sec", 0)

        # Fetch relevant transcript chunks (±120 second window)
        transcript_text = ""
        if db:
            try:
                chunks = (
                    db.query(TranscriptChunk)
                    .filter(
                        TranscriptChunk.video_asset_id == video_asset_id,
                        TranscriptChunk.start_sec <= video_position_sec + 120,
                        TranscriptChunk.end_sec >= video_position_sec - 120,
                    )
                    .order_by(TranscriptChunk.start_sec)
                    .limit(3)
                    .all()
                )
                transcript_text = "\n".join([chunk.text for chunk in chunks])
            except Exception as e:
                logger.warning(f"Failed to fetch transcript chunks: {e}")

        # Fallback transcript if none found
        if not transcript_text:
            transcript_text = (
                "This video covers important training material. "
                "Watch carefully and try to understand the key concepts."
            )

        # Try to generate with AI, fall back to simple question
        try:
            settings = get_settings()
            if settings.openai_api_key != "replace-me":
                provider = OpenAICompatibleProvider()
                prompt = build_question_prompt(video_title, transcript_text, video_position_sec)
                result = await provider.generate_structured_output(prompt, "question_payload")
                logger.info("Generated question via AI")
                return result
        except Exception as e:
            logger.warning(f"AI question generation failed, using fallback: {e}")

        # Fallback: create a simple question from the transcript
        return {
            "question": f"What is the main topic discussed in this section of '{video_title}'?",
            "type": "mcq",
            "options": [
                "The primary concept introduced",
                "A supporting detail",
                "A conclusion point",
                "An unrelated topic",
            ],
            "correct_index": 0,
            "hint": "Listen carefully to the introduction of new topics.",
        }

