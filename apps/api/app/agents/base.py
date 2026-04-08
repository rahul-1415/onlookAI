from abc import ABC, abstractmethod


class AgentAdapter(ABC):
    @abstractmethod
    async def run(self, payload: dict) -> dict:
        raise NotImplementedError

