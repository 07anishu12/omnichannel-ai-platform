import re
from typing import Any

from .contracts_v1 import EventEnvelopeV1

FORBIDDEN_PAYLOAD_KEY = re.compile(
    r"(password|passwd|secret|token|credential|api[-_]?key|authorization|cookie)",
    re.IGNORECASE,
)


def _has_forbidden_key(value: Any) -> bool:
    if isinstance(value, list):
        return any(_has_forbidden_key(item) for item in value)
    if isinstance(value, dict):
        return any(
            FORBIDDEN_PAYLOAD_KEY.search(key) is not None or _has_forbidden_key(nested)
            for key, nested in value.items()
        )
    return False


def parse_event_envelope(data: dict[str, Any]) -> EventEnvelopeV1:
    event = EventEnvelopeV1.model_validate(data)
    if _has_forbidden_key(event.payload):
        raise ValueError("payload must not carry credential-like keys")
    return event
