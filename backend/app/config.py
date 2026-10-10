from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = Path(__file__).resolve().parent.parent
_project_root = _backend_dir.parent


class Settings(BaseSettings):
    app_name: str = "ContextPortal"
    redis_url: str = "redis://localhost:6379"
    serpapi_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=(
            str(_project_root / ".env"),
            str(_backend_dir / ".env"),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
