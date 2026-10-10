# ADR-0003: Stage 02 environment contract

Status: Proposed. Operator decisions below remain open. This ADR does not accept Stage 02.

Date: 2026-10-10

Decision owners: Platform operator (pending sign-off on open items)

## Context

Prompt 02 in the canonical promptbook (`/tmp/omni-checks/promptbook.txt`, lines 516-535) lists the ENV / CONFIG names `DATABASE_URL`, `REDIS_URL`, `QDRANT_URL`, `AI_SERVICE_URL`, `APP_ORIGIN`, and `NODE_ENV`. The implementation diverges from that list in two places, and the divergence must be recorded rather than silently absorbed.

Related canonical references:

- Line 522: Prompt 02 ENV list, including `DATABASE_URL`, `AI_SERVICE_URL`, `APP_ORIGIN`.
- Line 564: `TEST_DATABASE_URL` in Prompt 03 quality checks.
- Lines 623-630: Prompt 05 names `DATABASE_URL`, `DB_POOL_LIMIT`, `DB_QUERY_TIMEOUT`, and a migration-role secret reference.
- Line 1018: Prompt 17 names `APP_ORIGIN` for the dashboard.
- Lines 1812-1817: Prompt 40-era AI contract names `AI_SERVICE_URL` and `AI_SERVICE_AUTH_REF`.
- Lines 528-529: Prompt 02 TESTS requires proof that Python has no MySQL write credentials.
- Line 564: Prompt 03 `TEST_DATABASE_URL` (test-only credentials).

## Decision

1. **MySQL configuration stays split** into `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD` (root only in local Compose). The implementation does not define `DATABASE_URL`. This deviates from the literal Prompt 02 list at line 522. The reason: a single URL would embed the password in a value that is logged and echoed by tooling, and `apps/api/src/config.ts` requires `MYSQL_PASSWORD` explicitly with no literal fallback (commit `b4ee65b`). The deviation is recorded here and is not accepted as canonical until the operator approves it.

2. **The AI service has no business-database credentials.** `services/ai-service/app/config.py` refuses to start if any of these names is set in its environment: `DATABASE_URL`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. `services/ai-service/tests/test_app.py` parametrizes over the full set. Grep confirms that only `apps/api` imports `mysql2`, and the AI service has no database driver dependency.

3. **`AI_SERVICE_URL` and `APP_ORIGIN` are not defined in code.** Both appear in the canonical Prompt 02 list (line 522). They are not yet wired. The code does not read them, and no default is baked in. This is an open operator decision. No AI-service port is defined anywhere in the repo, so no `AI_SERVICE_URL` default is recommended until the operator chooses one. The web dev server already binds `127.0.0.1:3000` (`apps/web/package.json`), so `APP_ORIGIN=http://127.0.0.1:3000` is the proposed default, to be confirmed. Until the operator decides, Stage 02 evidence reports these two names as **not implemented**, not as satisfied.

4. **Local infrastructure literals.** `deploy/local/compose.yaml` contains `MYSQL_PASSWORD: local-app-password` and `MYSQL_ROOT_PASSWORD: local-root-password`, and the healthcheck uses the literal root password. `.env.example` contains placeholders only. These are local-only throwaway values bound to 127.0.0.1. They are not production secrets. Operator decision: keep the literals for local use, or move them to `.env`-sourced interpolation.

5. **No canonical requirement is changed by this ADR.** Items 1, 3, and 4 are recorded as deviations or pending decisions. Prompts 11, 12, and 13 are not started.

## Status rules

- This ADR records the environment contract as implemented. It does not accept Stage 02.
- Stage 02 stays `verification_status: null` and `execution_state: interrupted` in `docs/stage-ledger.md` and `docs/stage-index.md` until every mandatory criterion is evidenced and the operator accepts it.
- Changing item 1 (`DATABASE_URL`) or item 3 (`AI_SERVICE_URL`, `APP_ORIGIN`) requires a superseding ADR and an operator decision.
