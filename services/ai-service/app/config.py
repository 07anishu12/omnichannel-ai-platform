import os
from dataclasses import dataclass


FORBIDDEN_DATABASE_ENV_NAMES = {
    "DATABASE_URL",
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_DATABASE",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_ROOT_PASSWORD",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
}


@dataclass(frozen=True)
class Settings:
    service_token: str
    qdrant_url: str
    qdrant_api_key: str | None
    require_qdrant: bool


def load_settings() -> Settings:
    forbidden = sorted(name for name in FORBIDDEN_DATABASE_ENV_NAMES if name in os.environ)
    if forbidden:
        raise RuntimeError(f"AI service refuses database credential names: {', '.join(forbidden)}")
    return Settings(
        service_token=os.getenv("AI_SERVICE_AUTH_TOKEN", "local-only-change-me"),
        qdrant_url=os.getenv("QDRANT_URL", "http://127.0.0.1:6333"),
        qdrant_api_key=os.getenv("QDRANT_API_KEY") or None,
        require_qdrant=os.getenv("AI_REQUIRE_QDRANT", "false").lower() == "true",
    )
