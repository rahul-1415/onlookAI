from app.agents.base import AgentAdapter


class AnswerEvaluationAgent(AgentAdapter):
    async def run(self, payload: dict) -> dict:
        raise NotImplementedError(
            "Implement transcript-grounded answer evaluation using an AI provider."
        )

