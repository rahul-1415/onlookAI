from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.auth import CurrentUser


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user() -> CurrentUser:
    return CurrentUser(
        id="placeholder-user",
        org_id="placeholder-org",
        email="placeholder@example.com",
        name="Placeholder User",
        role="org_admin",
    )

