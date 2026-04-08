from collections.abc import Callable

from app.utils.enums import UserRole


def require_roles(*roles: UserRole) -> Callable[[], tuple[UserRole, ...]]:
    async def dependency() -> tuple[UserRole, ...]:
        return roles

    return dependency

