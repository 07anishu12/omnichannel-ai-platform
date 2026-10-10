# Local development

## Boundaries

- `apps/web` is the Next.js dashboard. It calls the business API and never connects directly to databases, queues, Qdrant, secrets, or providers.
- `apps/api` is the Fastify business API. It owns future durable business writes and external side effects.
- `apps/worker` is a separate Node process. BullMQ/Redis is coordination only; no business truth is stored only in Redis.
- `services/ai-service` is private FastAPI computation. It rejects MySQL/database credential names and has no business-write client.
- `deploy/local/compose.yaml` binds MySQL, Redis, Qdrant, and the private AI service to `127.0.0.1` only.

## Commands

```bash
cp .env.example .env
docker compose -f deploy/local/compose.yaml up -d
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm validate:stage-fixtures
pnpm check:boundaries
pnpm smoke:web-api
pnpm test:mysql
pnpm exec playwright install --with-deps chromium
pnpm test:browser
pnpm validate:stage --stage 02
pnpm dev
pnpm dev:ai
```

The API, worker, and AI readiness endpoints distinguish process liveness from dependency reachability. Missing dependencies may leave a process running while readiness returns `503`; this is intentional.

Automated tests use synthetic data and fake adapters. Real sends, imports, calls, account changes, and provider credentials are disabled.

## Local data and shutdown

Compose volumes are named `omnichannel_mysql_data`, `omnichannel_redis_data`, and `omnichannel_qdrant_data`. `docker compose stop` preserves them. Do not run `down -v` unless intentionally deleting synthetic local data.
