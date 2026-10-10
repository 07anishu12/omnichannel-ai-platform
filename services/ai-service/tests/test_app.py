import os

import pytest
from fastapi.testclient import TestClient

from app.config import FORBIDDEN_DATABASE_ENV_NAMES


def test_ai_service_health_and_private_boundary() -> None:
    from app.main import app, settings

    client = TestClient(app)
    assert client.get("/health/live").json() == {"status": "ok", "service": "ai-service"}
    assert client.get("/internal/v1/health").status_code == 401
    response = client.get(
        "/internal/v1/health",
        headers={"Authorization": f"Bearer {settings.service_token}"},
    )
    assert response.status_code == 200


@pytest.mark.parametrize("name", sorted(FORBIDDEN_DATABASE_ENV_NAMES))
def test_database_credentials_are_rejected(monkeypatch: pytest.MonkeyPatch, name: str) -> None:
    from app.config import load_settings

    monkeypatch.setenv(name, "synthetic-not-a-secret")
    with pytest.raises(RuntimeError, match=name):
        load_settings()
