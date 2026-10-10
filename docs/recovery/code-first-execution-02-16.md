# Code-first execution prompts for Stages 02–16

This file is an execution brief for Claude Code/Codex. It is NOT application implementation. Run the full promptbook downloaded from this conversation for detailed stage-specific requirements.

## Immediate directive
1. Start in `/Users/anny/Desktop/omnichannel`.
2. Inspect current branch, dirty worktree, local HEAD, origin/main, actual files and canonical docs. Never reset or overwrite user work.
3. Resolve the mismatch between latest local reports and GitHub. Current GitHub ledger at the time of publication says Stage 02 is null/interrupted; stages 03–08 failed; 09–16 not started. Do not assume pasted local reports have been pushed.
4. Work on earliest incomplete prerequisite only. Stage order is strictly 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16. Each stage must pass and be accepted before starting the next.
5. When eligible, MUST implement actual application source, tests, schemas, migrations, config, CI and runtime behavior. A stage report alone is not completion. No placeholder-only functions, empty tests, fake implementations in production path, or TODO-only commits.
6. Use RTK if already available: `command -v rtk`, `rtk --version`, then `rtk help`. Follow official setup for installed agent/version. Don't alter global configuration without confirmation. Use compact output for successful commands but preserve full logs + actual exit codes for every acceptance gate. Do not hide failures.
7. Optional Ponytail, Graphify and OmniRoute are not prerequisites. Verify versions/security/capabilities before using; never route secrets through an unapproved proxy.
8. For each failure: reproduce, capture logs/exit, identify root cause, fix source/config, add regression test, rerun targeted and full gates.
9. Preserve canonical architecture: Next.js/React/TypeScript; Fastify/Node API; Node/BullMQ workers; MySQL 8.4/InnoDB durable authority; Redis transient coordination; Python/FastAPI bounded AI only; Qdrant derived. Node alone owns business writes/external effects. No PostgreSQL RLS assumptions.
10. Use fake provider adapters for tests; never send actual messages/calls or use production credentials.
11. Commit actual code per accepted stage, push stage branch and verify remote SHA/file paths. Do not force push or auto-merge main. If direct local push is unavailable, use approved GitHub connector for the actual source files; never call documentation-only commits implementation.
12. Keep status accurate. `pnpm validate:stage` exit 0 alone is not stage acceptance.

## Prompt files in this pack
- Stage 02: finish workspace/runtime/Compose/services/readiness/config/CI/tests; reverify typecheck build order, API/worker/AI boundaries and clean-clone reproducibility.
- Stages 03–08: implement actual quality gates/CI; versioned Zod/OpenAPI/event/config contracts; MySQL/migrations/scoped repositories; authentication/membership; centralized authorization/support grants; secret store and tenant credential references.
- Stages 09–11: tenant lifecycle; contact/identity/lead records; consent/preferences/suppression with execution-time policy checks.
- Stages 12–16: provider assignment invariants; unified conversation store; durable inbox/outbox; fair BullMQ scheduling and recovery; audit/idempotency/export primitives.

## Acceptance rule
Update `docs/stages/NN.md` with evidence but never let documentation substitute for code/tests. Update ledger/index only when canonical criteria are satisfied. Do not start the next stage if the current one is blocked.