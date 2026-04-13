from pydantic import BaseModel

from app.utils.enums import UserRole


class LoginRequest(BaseModel):
    email: str | None = None
    password: str | None = None
    firebase_id_token: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    role: UserRole


class CurrentUser(BaseModel):
    id: str
    org_id: str
    email: str
    name: str
    role: UserRole
