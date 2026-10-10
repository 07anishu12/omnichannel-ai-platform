# ADR-0003: Stage 02 environment contract

Status: Accepted for Stage 02 environment naming, defaults, and local-infrastructure secret handling. This ADR does not accept Stage 02; Stage 02 acceptance is recorded only in `docs/stage-ledger.md` and `docs/stage-index.md`.

Date: 2026-10-10

Decision owners: Platform operator (decisions A-D approved in the Stage 02 mission brief)

## Context

Prompt 02 in the canonical promptbook (`/tmp/omni-checks/promptbook.txt`, lines 516-535) lists the ENV / CONFIG names `DATABASE_URL`, `REDIS_URL`, `QDRANT_URL`, `AI_SERVICE_URL`, `APP_ORIGIN`, and `NODE_ENV`. The implementation diverges from that list in one place (`DATABASE_URL`) and implements the rest. Each divergence is recorded here rather than silently absorbed.

Related canonical references:

- Line 522: Prompt 02 ENV list, including `DATABASE_URL`, `AI_SERVICE_URL`, `APP_ORIGIN`.
- Line 564: `TEST_DATABASE_URL` in Prompt 03 quality checks.
- Lines 623-630: Prompt 05 names `DATABASE_URL`, `DB_POOL_LIMIT`, `DB_QUERY_TIMEOUT`, and a migration-role secret reference.
- Line 1018: Prompt 17 names `APP_ORIGIN` for the dashboard.
- Lines 1812-1817: Prompt 40-era AI contract names `AI_SERVICE_URL` and `AI_SERVICE_AUTH_REF`.
- Lines 528-529: Prompt 02 TESTS requires proof that Python has no MySQL write credentials.

## Decision

### A. MySQL configuration stays split (deviation from Prompt 02 line 522)

Configuration uses `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD` (root only for local Compose). `DATABASE_URL` is not defined.

- Why: a single URL embeds the password in a value that is logged and echoed by tooling. `apps/api/src/config.ts` requires `MYSQL_PASSWORD` explicitly when `API_REQUIRE_MYSQL` is true, with no literal fallback (commit `b4ee65b`).
- Alternative rejected: a `DATABASE_URL` with credentials, because it puts the password inside a loggable string.
- Scope: Prompt 05 (`DATABASE_URL`, `DB_POOL_LIMIT`) may revisit this with its own ADR. Changing it requires a superseding ADR.

### B. `AI_SERVICE_URL` is implemented with a loopback default

- `apps/api/src/config.ts` reads `AI_SERVICE_URL` (default `http://127.0.0.1:8000`, the same port as `AI_SERVICE_PORT` in `.env.example`). It must be an absolute `http` or `https` URL, and a trailing slash is stripped.
- `NODE_ENV=production` requires it explicitly. There is no implicit production default.
- `AI_SERVICE_TIMEOUT_MS` (default `2000`, bounded to 1-60000) is the request budget for any future AI call. Stage 02 defines the bound but adds no AI call path.
- The AI service never reads `AI_SERVICE_URL`. It refuses database credential names (see item E).
- Security: the API rejects non-http(s) schemes, so a `javascript:` or `file:` value fails at startup.

### C. `APP_ORIGIN` is implemented with a loopback default

- `apps/api/src/config.ts` reads `APP_ORIGIN` (default `http://127.0.0.1:3000`, the web dev server). It is normalized to its origin, so any path is dropped.
- `NODE_ENV=production` requires it explicitly.
- No CORS or CSRF behavior is loosened. Stage 02 exposes the trusted origin on the config object only. Enforcement belongs to the stage that adds browser-facing routes.
- Security: non-http(s) schemes are rejected at startup.

### D. Compose secrets come from the environment, not literals

- `deploy/local/compose.yaml` uses `${MYSQL_PASSWORD:?...}` and `${MYSQL_ROOT_PASSWORD:?...}` interpolation. Compose refuses to render when either is unset.
- The MySQL healthcheck reads the root password from the container environment (`-p"$$MYSQL_ROOT_PASSWORD"`), so it no longer embeds a literal.
- `.env.example` holds local-only placeholder values (`local-app-password`, `local-root-password`), bound to 127.0.0.1. These are not production secrets. A real `.env` is git-ignored (`.gitignore`: `.env`, `.env.*`, `!.env.example`).
- Evidence: rendering without the variables exits 1 with both required-variable errors; rendering with `--env-file .env.example` exits 0 (see `docs/stages/02.md`).

### E. The AI service has no business-database credentials

`services/ai-service/app/config.py` refuses to start if any of these names is set: `DATABASE_URL`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. `services/ai-service/tests/test_app.py` covers the full set. Only `apps/api` depends on `mysql2`; the AI service has no database driver dependency.

### F. Local infrastructure ports and literals

Local infrastructure is bound to 127.0.0.1 only. Local development values are not production secrets, and production configuration must come from a secret store (Prompt 07), not from `.env`.

## Status rules

- This ADR records the Stage 02 environment contract as implemented. It does not accept Stage 02.
- Stage 02 stays `verification_status: null` and `execution_state: interrupted` in `docs/stage-ledger.md` and `docs/stage-index.md` until every mandatory criterion is evidenced and the operator accepts it.
- Changing A (`DATABASE_URL`) or the names in B and C requires a superseding ADR and an operator decision.
