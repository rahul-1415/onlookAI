from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "OnlookAI API"
    api_v1_prefix: str = "/api"
    database_url: str = Field(
        default="postgresql+psycopg://onlook:onlook@localhost:5432/onlook",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    openai_base_url: str = Field(
        default="https://api.openai.com/v1", alias="OPENAI_BASE_URL"
    )
    openai_api_key: str = Field(default="replace-me", alias="OPENAI_API_KEY")
    jwt_secret: str = Field(default="replace-me", alias="JWT_SECRET")
    local_storage_root: str = Field(default="../../.storage", alias="LOCAL_STORAGE_ROOT")
    web_cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"], alias="WEB_CORS_ORIGINS"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

