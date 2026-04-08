from app.agents.base import AgentAdapter


class QuestionGenerationAgent(AgentAdapter):
    async def run(self, payload: dict) -> dict:
        raise NotImplementedError(
            "Implement transcript-grounded question generation using an AI provider."
        )

