import logging

from app.agents.base import AgentAdapter
from app.agents.prompts import build_evaluation_prompt
from app.core.config import get_settings
from app.integrations.ai.openai_compatible import OpenAICompatibleProvider

logger = logging.getLogger("onlook")


class AnswerEvaluationAgent(AgentAdapter):
    async def run(self, payload: dict) -> dict:
        """
        Evaluate a learner's answer to a multiple choice question.

        Payload should contain:
        - question: str
        - options: list[str]
        - correct_index: int (0-indexed)
        - user_answer: str
        """
        question = payload.get("question", "")
        options = payload.get("options", [])
        correct_index = payload.get("correct_index", 0)
        user_answer = payload.get("user_answer", "").strip()

        # Try AI evaluation first
        try:
            settings = get_settings()
            if settings.openai_api_key != "replace-me":
                provider = OpenAICompatibleProvider()
                prompt = build_evaluation_prompt(question, options, correct_index, user_answer)
                result = await provider.generate_structured_output(prompt, "evaluation_payload")
                logger.info("Generated evaluation via AI")
                return result
        except Exception as e:
            logger.warning(f"AI evaluation failed, using fallback: {e}")

        # Fallback: simple string matching
        correct_answer = options[correct_index] if correct_index < len(options) else ""
        is_correct = user_answer.lower() == correct_answer.lower()

        if is_correct:
            return {
                "is_correct": True,
                "feedback": f"Correct! The answer is '{correct_answer}'.",
                "next_action": "resume",
            }
        else:
            return {
                "is_correct": False,
                "feedback": f"Not quite. The correct answer is '{correct_answer}'. Please try again or watch the video section again.",
                "next_action": "retry",
            }

