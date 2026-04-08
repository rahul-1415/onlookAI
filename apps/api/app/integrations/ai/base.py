from abc import ABC, abstractmethod


class AIProviderAdapter(ABC):
    @abstractmethod
    async def generate_structured_output(self, prompt: str, schema_name: str) -> dict:
        raise NotImplementedError

