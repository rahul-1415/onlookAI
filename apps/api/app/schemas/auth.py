from pydantic import BaseModel

from app.utils.enums import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class CurrentUser(BaseModel):
    id: str
    org_id: str
    email: str
    name: str
    role: UserRole
