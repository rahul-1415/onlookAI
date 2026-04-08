from abc import ABC, abstractmethod


class LMSAdapter(ABC):
    @abstractmethod
    async def sync_assignments(self) -> None:
        raise NotImplementedError

