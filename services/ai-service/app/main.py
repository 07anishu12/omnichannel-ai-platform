from fastapi import Depends, FastAPI, Header, HTTPException
import httpx

from .config import Settings, load_settings

settings = load_settings()
app = FastAPI(title="Private omnichannel AI service", version="0.1.0", docs_url=None, redoc_url=None)


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
        raise HTTPException(status_code=401, detail="unauthorized")


@app.get("/internal/v1/health", dependencies=[Depends(require_service_auth)])
async def internal_health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service", "audience": "omnichannel-internal"}
