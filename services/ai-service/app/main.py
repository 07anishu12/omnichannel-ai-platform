from uuid import uuid4

from fastapi import Depends, FastAPI, Header, Request
from fastapi.responses import JSONResponse
import httpx

from .config import Settings, load_settings

settings = load_settings()
app = FastAPI(title="Private omnichannel AI service", version="0.1.0", docs_url=None, redoc_url=None)


class ServiceAuthError(Exception):
    pass


@app.exception_handler(ServiceAuthError)
async def service_auth_error(request: Request, _exc: ServiceAuthError) -> JSONResponse:
    incoming = request.headers.get("x-correlation-id", "")
    correlation_id = incoming if 1 <= len(incoming) <= 128 else str(uuid4())
    body = {"error": {"code": "unauthorized", "message": "unauthorized", "correlationId": correlation_id}}
    return JSONResponse(status_code=401, content=body)


@app.get("/health/live")
async def live() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


@app.get("/health/ready")
async def ready() -> tuple[dict[str, object], int] | dict[str, object]:
    dependency: dict[str, str] = {"name": "qdrant", "status": "disabled"}
    if settings.require_qdrant:
        try:
            async with httpx.AsyncClient(timeout=1) as client:
                response = await client.get(f"{settings.qdrant_url.rstrip('/')}/readyz", headers=qdrant_headers())
                response.raise_for_status()
            dependency = {"name": "qdrant", "status": "reachable"}
        except Exception:
            dependency = {"name": "qdrant", "status": "unreachable", "detail": "dependency unavailable"}
    body = {"status": "ready" if dependency["status"] != "unreachable" else "not_ready", "service": "ai-service", "dependencies": [dependency]}
    return body if body["status"] == "ready" else (body, 503)


def qdrant_headers() -> dict[str, str]:
    return {"api-key": settings.qdrant_api_key} if settings.qdrant_api_key else {}


async def require_service_auth(authorization: str | None = Header(default=None)) -> None:
    expected = f"Bearer {settings.service_token}"
    if authorization != expected:
        raise ServiceAuthError


@app.get("/internal/v1/health", dependencies=[Depends(require_service_auth)])
async def internal_health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service", "audience": "omnichannel-internal"}
