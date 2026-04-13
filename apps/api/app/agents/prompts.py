import json

from app.core.logging import logger


def build_question_prompt(video_title: str, transcript_text: str, video_position_sec: float) -> str:
    """Build a prompt for AI to generate a comprehension question."""
    return f"""Based on the following video transcript, generate a multiple choice question that tests comprehension.

Video Title: {video_title}
Video Position: {video_position_sec:.0f} seconds

Transcript excerpt:
{transcript_text}

Generate a JSON response with the following structure (strictly valid JSON):
{{
    "question": "A clear, specific question about the transcript content",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "hint": "A brief hint if the learner needs help"
}}

The correct_index should be 0-3 indicating which option is correct (0-indexed).
Make the question challenging but fair, testing key concepts from the transcript."""


def build_evaluation_prompt(
    question: str,
    options: list[str],
    correct_index: int,
    user_answer: str,
) -> str:
    """Build a prompt for AI to evaluate a learner's answer."""
    correct_answer = options[correct_index] if correct_index < len(options) else "Unknown"

    return f"""Evaluate whether the learner's answer is correct.

Question: {question}

Available options:
{json.dumps(options)}

Correct answer (index {correct_index}): {correct_answer}

Learner's answer: {user_answer}

Generate a JSON response with the following structure (strictly valid JSON):
{{
    "is_correct": true,
    "feedback": "Specific feedback about why the answer is correct or incorrect",
    "next_action": "resume"
}}

next_action should be one of: "resume" (correct), "retry" (incorrect, try again), "replay_then_retry" (incorrect, replay video section then try)

Provide clear, educational feedback that helps the learner understand the concept."""


def log_prompt_placeholder(name: str) -> None:
    logger.warning("Prompt '%s' is scaffolded but not implemented.", name)

