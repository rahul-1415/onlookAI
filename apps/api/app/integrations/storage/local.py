from pathlib import Path

from app.core.config import get_settings
from app.integrations.storage.base import StorageAdapter


class LocalStorageAdapter(StorageAdapter):
    async def save(self, key: str, content: bytes) -> str:
        root = Path(get_settings().local_storage_root).resolve()
        target = root / key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return str(target)

