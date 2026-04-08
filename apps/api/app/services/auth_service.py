from app.schemas.auth import LoginRequest


class AuthService:
    async def login(self, payload: LoginRequest) -> None:
        raise NotImplementedError(f"Implement login flow for {payload.email}.")

