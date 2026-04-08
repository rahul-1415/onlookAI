from fastapi import APIRouter

from app.schemas.auth import CurrentUser, LoginRequest
from app.schemas.common import ScaffoldResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=ScaffoldResponse)
async def login(payload: LoginRequest) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="auth.login",
        next_step=f"Implement email/password auth for {payload.email}.",
    )


@router.get("/me", response_model=CurrentUser)
async def get_me() -> CurrentUser:
    return CurrentUser(
        id="placeholder-user",
        org_id="placeholder-org",
        email="placeholder@example.com",
        name="Placeholder User",
        role="org_admin",
    )


@router.post("/logout", response_model=ScaffoldResponse)
async def logout() -> ScaffoldResponse:
    return ScaffoldResponse(
        area="auth.logout",
        next_step="Invalidate the active session or access token.",
    )

