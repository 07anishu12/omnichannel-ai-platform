# Omnichannel platform

This is one configurable multi-tenant product. Tenant behavior belongs in versioned configuration and policy data; client forks are not supported.

## Local development

Prerequisites:

- Node.js 24.21.0 LTS or newer supported Node LTS
- pnpm 12.8.1
- Python 3.12–3.14 and `uv`
- Docker with Docker Compose

Start local dependencies without deleting persistent volumes:

```bash
cp .env.example .env
docker compose -f deploy/local/compose.yaml up -d
```

Install and run the Node services:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm dev:ai
```

The services bind to loopback for local development:

- Dashboard: http://127.0.0.1:3000
- Business API: http://127.0.0.1:4000
- Worker health: http://127.0.0.1:4001
- Private AI service: http://127.0.0.1:8000

Health endpoints:

- `GET /health/live` proves the process is running.
- `GET /health/ready` checks required configured dependencies and returns `503` when they are unavailable.
- The AI service also exposes authenticated `GET /internal/v1/health`; it has no public dashboard proxy.

Stop services while preserving local volumes:

```bash
docker compose -f deploy/local/compose.yaml stop
```

Remove local containers and volumes only when intentionally resetting synthetic local data:

```bash
docker compose -f deploy/local/compose.yaml down
```

Never use production credentials, customer payloads, recordings, exports, or real provider endpoints in this local stack. `.env` is ignored; `.env.example` contains safe placeholders only.

## Stage validation

The canonical stage index is `docs/stage-index.md`. Run the process validator from the repository root:

```bash
pnpm validate:stage -- --stage 02
```

It rejects duplicate/unknown stages, invalid statuses, mismatched ledger/index entries, unmet prerequisites, and verified stages without required implementation evidence.
