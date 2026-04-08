from abc import ABC, abstractmethod


class StorageAdapter(ABC):
    @abstractmethod
    async def save(self, key: str, content: bytes) -> str:
        raise NotImplementedError

