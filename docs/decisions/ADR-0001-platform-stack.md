# ADR-0001: Shared multi-tenant platform stack and side-effect boundaries

- **Status:** Accepted for Stage 01 planning freeze
- **Date:** 2026-10-09
- **Decision owners:** Platform/API engineering, SRE/Operations, Security/Privacy, Product
- **Scope:** Runtime and data boundaries for the reusable multi-client omnichannel product

## Context

The product must serve multiple clients from one reusable implementation while supporting web UI, business APIs, asynchronous work, durable business data, AI/retrieval computation, external messaging, and future voice capabilities. Tenant isolation, provider uncertainty, consent, and ambiguous external delivery are correctness requirements, not follow-up hardening.

The inspected workspace had no application, manifest, lockfile, migration, test, deployment, or Git history. This ADR therefore records the agreed target architecture and its evidence status; it does not assert that any component is already implemented or that any provider integration is approved.

## Decision

### Stack

- **Dashboard:** Next.js, React, TypeScript.
- **Business API:** Node.js, Fastify, Zod at runtime trust boundaries, and OpenAPI as the published HTTP contract.
- **Workers:** Node.js workers using BullMQ and Redis for transient queue coordination, retry scheduling, and worker coordination.
- **Durable data:** MySQL 8.4 LTS/InnoDB with explicit tenant scope, same-tenant constraints, and repository-level scope enforcement.
- **AI service:** private Python/FastAPI service for bounded embeddings, retrieval, classification, generation, citations, and safety signals.
- **Vector index:** Qdrant as a derived, rebuildable index with tenant/access filters and trusted-record verification.
- **Files:** S3-compatible object storage, provider to be selected, with MySQL metadata and tenant-scoped opaque keys.
- **Secrets:** secret manager or vault, provider to be selected; MySQL stores references and metadata only.
- **External channels:** verified Node adapters for Meta and approved communications/voice providers.

### Ownership and trust boundaries

1. Node is the only application boundary that owns durable business writes and external side effects.
2. FastAPI is computation-only. It has no credentials or network capability for business-table writes, provider sends, or calls.
3. Redis loss must not lose business truth. MySQL inbox/outbox/job/effect records enable replay and reconciliation.
4. Qdrant is never authoritative. A result is usable only after tenant/access/owner/version checks against trusted MySQL records.
5. A tenant ID from a browser or external payload does not grant access. Tenant scope comes from authenticated identity or verified connector ownership.
6. Credentials are resolved from a vault at the effect boundary and are never stored as plaintext in MySQL.
7. Calling is four-state gated: configured, provider-verified, policy/consent-eligible, and capability-enabled. It is disabled by default and WhatsApp messaging, WhatsApp Calling, PSTN, and managed AI voice are separate capabilities.

## Alternatives considered

| Alternative | Decision | Reason |
|---|---|---|
| Separate codebase per client | Rejected | Duplicates fixes and security controls and makes tenant-wide behavior inconsistent. Shared code plus versioned configuration satisfies the reusable-product objective. |
| PostgreSQL-specific row-level security | Rejected | The target durable store is MySQL/InnoDB. Isolation must be explicit in schema, repositories, and tests rather than assumed from a different database. |
| Redis as the business database | Rejected | Redis is temporary coordination. Business truth, audit, effect state, and replay state need durable transactional storage. |
| Python service with direct business writes or provider tools | Rejected | It blurs authorization and side-effect boundaries. Python returns bounded computation; Node decides and executes actions. |
| Qdrant as the record of truth | Rejected | Vector indexes are derived and may be stale, incomplete, or contaminated. MySQL ownership/version records remain authoritative. |
| Store provider tokens in MySQL | Rejected | A compromise of application data would expose external accounts. The vault owns secret material; MySQL stores references and metadata. |
| Enable calling when a connector is configured | Rejected | Configuration does not prove provider approval, consent, capability, regional eligibility, safety policy, or test completion. |
| Claim exactly-once provider delivery | Rejected | Network/provider ambiguity makes this unsafe. Use idempotency, effect receipts, provider status lookup, and reconciliation. |

## Consequences

### Positive

- Client-specific behavior is configuration and policy data with one release path.
- Durable state and side effects have a single owner and auditable transaction boundaries.
- Tenant isolation is testable without relying on a database feature unavailable in the selected store.
- AI and retrieval can evolve independently without gaining business or provider authority.
- Derived indexes, queues, and provider state can be rebuilt or reconciled.

### Costs and known ceilings

- Every repository/job/event path must carry and enforce scope; omission is a correctness defect.
- MySQL schema design needs composite keys and disciplined migrations.
- Outbox and reconciliation add state machines and operational work.
- Qdrant results require extra trusted-record verification.
- Provider enablement is slower because verification and approval are explicit gates.
- Shared-database tenancy needs capacity and restore testing before scale claims can be made.

## Acceptance gates before feature work

- Stage 02 pins Node/Python/package/runtime versions in manifests and CI.
- Stage 03 demonstrates tenant-scoped repositories, same-tenant constraints, and two-tenant isolation tests.
- Stage 04 demonstrates durable inbox/outbox and replay/reconciliation behavior.
- Stage 09 demonstrates Qdrant tenant/access filters plus MySQL ownership/version verification.
- Stage 15 maps security controls to OWASP ASVS 5.0.0 and rehearses secret rotation, backup/restore, and incident response.
- Stage 16 enables only integrations with recorded provider verification and an approved rollout change.

## Evidence and unresolved decisions

Official documentation was accessible for Node.js, Next.js, Fastify, BullMQ, FastAPI, Zod, OpenAPI, Qdrant, and OWASP ASVS. MySQL official pages returned HTTP 403 from this environment. Meta documentation fetches returned non-2xx responses. Exact package versions, provider API versions, identity provider, vault, object storage, deployment target, and provider approvals remain unresolved.

See [`../architecture.md`](../architecture.md), [`../requirements-to-stages.md`](../requirements-to-stages.md), and [`../stages/01.md`](../stages/01.md) for the evidence inventory and delivery gates.

## Rollback

This ADR is documentation-only. Revert the documentation change. No application or database data exists in the inspected workspace to restore.
