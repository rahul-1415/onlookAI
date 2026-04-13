import json
import logging

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.integrations.ai.base import AIProviderAdapter

logger = logging.getLogger("onlook")


class OpenAICompatibleProvider(AIProviderAdapter):
    def __init__(self):
        settings = get_settings()
        if settings.openai_api_key == "replace-me":
            raise ValueError(
                "OPENAI_API_KEY is not configured. Set OPENAI_API_KEY environment variable."
            )
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
        )

    async def generate_structured_output(self, prompt: str, schema_name: str) -> dict:
        """Call OpenAI API with JSON schema response format."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = response.choices[0].message.content
            if content is None:
                raise ValueError("Empty response from OpenAI")

            result = json.loads(content)
            logger.info(f"Generated structured output for {schema_name}")
            return result
        except Exception as e:
            logger.error(f"Failed to generate structured output for {schema_name}: {e}")
            raise

