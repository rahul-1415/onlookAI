from app.integrations.ai.base import AIProviderAdapter


class OpenAICompatibleProvider(AIProviderAdapter):
    async def generate_structured_output(self, prompt: str, schema_name: str) -> dict:
        raise NotImplementedError(
            "Implement OpenAI-compatible structured output call "
            f"for schema {schema_name}."
        )

