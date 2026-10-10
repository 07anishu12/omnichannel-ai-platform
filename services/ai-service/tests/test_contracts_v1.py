import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel, ValidationError

from app.contract_rules import parse_event_envelope
from app.contracts_v1 import (
    ApiMetaV1Response,
    ErrorResponse,
    InternalHealthV1Response,
    LiveResponse,
    ReadinessResponse,
)

FIXTURES = Path(__file__).resolve().parents[3] / "packages" / "contracts" / "fixtures"


def load(name: str) -> dict[str, Any]:
    loaded: dict[str, Any] = json.loads((FIXTURES / name).read_text(encoding="utf-8"))
    return loaded


ROUND_TRIP_CASES: list[tuple[str, type[BaseModel]]] = [
    ("api-v1-meta.json", ApiMetaV1Response),
    ("internal-v1-health.json", InternalHealthV1Response),
    ("error-unsupported-version.json", ErrorResponse),
    ("error-stale-version.json", ErrorResponse),
]


@pytest.mark.parametrize(("name", "model"), ROUND_TRIP_CASES)
def test_node_fixture_round_trips_through_pydantic(name: str, model: type[BaseModel]) -> None:
    data = load(name)
    assert model.model_validate(data).model_dump(mode="json", by_alias=True) == data


def test_event_fixture_round_trips_through_guarded_parser() -> None:
    data = load("event-envelope-v1.json")
    assert parse_event_envelope(data).model_dump(mode="json", by_alias=True) == data


def test_unsupported_schema_version_is_rejected() -> None:
    meta = load("api-v1-meta.json")
    meta["schemaVersions"] = ["2"]
    with pytest.raises(ValidationError):
        ApiMetaV1Response.model_validate(meta)

    event = load("event-envelope-v1.json")
    event["schemaVersion"] = "2"
    with pytest.raises(ValidationError):
        parse_event_envelope(event)


def test_unknown_error_code_is_rejected() -> None:
    error = load("error-stale-version.json")
    error["error"]["code"] = "boom"
    with pytest.raises(ValidationError):
        ErrorResponse.model_validate(error)


def test_unknown_top_level_field_is_rejected() -> None:
    event = load("event-envelope-v1.json")
    event["extra"] = 1
    with pytest.raises(ValidationError):
        parse_event_envelope(event)


@pytest.mark.parametrize(
    "payload",
    [
        {"password": "synthetic"},
        {"nested": {"access_token": "synthetic"}},
        {"items": [{"apiKey": "synthetic"}]},
    ],
)
def test_credential_like_payload_keys_are_rejected(payload: dict[str, Any]) -> None:
    event = load("event-envelope-v1.json")
    event["payload"] = payload
    with pytest.raises(ValueError, match="credential-like"):
        parse_event_envelope(event)


def test_readiness_status_must_be_known() -> None:
    body = {"status": "maybe", "service": "ai-service", "dependencies": []}
    with pytest.raises(ValidationError):
        ReadinessResponse.model_validate(body)


def test_live_endpoint_matches_generated_model() -> None:
    from app.main import app

    response = TestClient(app).get("/health/live")
    assert LiveResponse.model_validate(response.json()).status == "ok"


def test_ready_endpoint_matches_generated_model() -> None:
    from app.main import app

    response = TestClient(app).get("/health/ready")
    ReadinessResponse.model_validate(response.json())


def test_internal_endpoint_matches_generated_model() -> None:
    from app.main import app, settings

    response = TestClient(app).get(
        "/internal/v1/health",
        headers={"Authorization": f"Bearer {settings.service_token}"},
    )
    assert InternalHealthV1Response.model_validate(response.json()).audience == "omnichannel-internal"


def test_internal_auth_failure_matches_error_envelope() -> None:
    from app.main import app

    response = TestClient(app).get("/internal/v1/health", headers={"x-correlation-id": "synthetic-correlation-9"})
    assert response.status_code == 401
    error = ErrorResponse.model_validate(response.json())
    assert error.error.code == "unauthorized"
    assert error.error.correlationId == "synthetic-correlation-9"
