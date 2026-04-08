from app.integrations.storage.base import StorageAdapter


class S3StorageAdapter(StorageAdapter):
    async def save(self, key: str, content: bytes) -> str:
        raise NotImplementedError(
            f"Implement S3-compatible upload flow for object key {key}."
        )

