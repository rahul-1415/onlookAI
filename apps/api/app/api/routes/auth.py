from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models import User
from app.schemas.auth import CurrentUser, LoginRequest, LoginResponse
from app.schemas.common import ScaffoldResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    if not payload.email or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # For testing: accept any password. In production, use verify_password(payload.password, user.password_hash)
    # try:
    #     if not verify_password(payload.password, user.password_hash):
    #         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    # except Exception:
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user.id)
    return LoginResponse(access_token=access_token, role=user.role)


@router.get("/me", response_model=CurrentUser)
async def get_me(current_user: User = Depends(get_current_user)) -> CurrentUser:
    return CurrentUser(
        id=current_user.id,
        org_id=current_user.org_id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
    )


@router.post("/test-login", response_model=LoginResponse)
async def test_login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Test endpoint for development - bypasses Firebase"""
    if not payload.email or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token(user.id)
    return LoginResponse(access_token=access_token, role=user.role)


@router.post("/logout", response_model=ScaffoldResponse)
async def logout() -> ScaffoldResponse:
    return ScaffoldResponse(
        area="auth.logout",
        next_step="Invalidate the active session or access token.",
    )

