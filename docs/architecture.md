# Multi-client omnichannel platform architecture

**Stage:** 01 — inspect and freeze the architecture
**Status:** Frozen for planning; feature implementation has not started, but an unverified Stage 02 scaffold exists
**Evidence timestamp:** 2026-10-09T19:18:25Z
**Repository evidence:** The initial 2026-10-09 preflight found no files or `.git`; subsequent recovery work initialized Git and created an unverified Stage 02 scaffold. The historical preflight is preserved in `docs/recovery/initial-audit.md`.

## 1. Architecture decisions that are frozen

1. One reusable product serves many tenants. Tenant-specific behavior is data-driven configuration and policy, not a separate codebase or fork.
2. The dashboard is Next.js, React, and TypeScript.
3. The business API is Node.js with Fastify. External inputs are validated at the boundary. Shared contracts are represented with Zod and OpenAPI.
4. Node.js workers use BullMQ. Redis is temporary coordination and queue infrastructure; it is not the durable business source of truth.
5. MySQL 8.4 LTS with InnoDB is the durable business store. Tenant-owned tables carry explicit tenant scope and use same-tenant constraints. PostgreSQL row-level security is not assumed.
6. A private Python/FastAPI service performs bounded AI and retrieval computation. It does not write business tables, send messages, place calls, or execute tools.
7. Qdrant is a rebuildable derived vector index. Every retrieval applies tenant and access filters, and Node verifies ownership and version against trusted MySQL records before a result can affect a response or action.
8. Provider credentials live in a secret manager or vault. MySQL stores a secret reference and non-secret connector metadata, never a plaintext provider token.
9. External channels use verified adapters. A connector being configured is not evidence that a live integration is verified or approved.
10. Calling is disabled by default. WhatsApp Calling, WhatsApp messaging, and PSTN/Exotel or other managed AI voice calling are separate capabilities with separate approval and test gates.
11. Durable inbox/outbox records, idempotency keys, effect receipts, and reconciliation are required. External delivery is at-least-once/ambiguous until reconciled; exactly-once external delivery is not claimed.

## 2. Preflight evidence

| Area inspected | Evidence | Consequence |
|---|---|---|
| Repository tree | `/Users/anny/Desktop/omnichannel` was empty at preflight | There are no existing modules to extend and no working files to preserve. The first implementation stage must establish the repository layout. |
| Git status/history | `git status`, `git diff`, and `git log` reported “not a git repository” | No branch, commit, or prior-stage report exists. Git must be initialized or the actual repository supplied before code delivery. |
| Manifests/lockfiles | No `package.json`, Node lockfile, Python manifest, or deployment file was found | Versions and scripts are not yet project-pinned. Stage 02 must create manifests and lockfiles. |
| Migrations/API/workers/integrations/tests | No source, migration, route, worker, integration, or test files were found | No application behavior or database data was changed in this stage. |
| Local runtimes | Node `v26.10.0`; npm `11.19.1`; Python `3.14.7`; Docker `29.8.0`; MySQL client `26.7.0`; Redis server `8.10.2` | These are workstation observations only, not project support commitments. Production versions must be pinned and tested in Stage 02. |
| Environment names | Process environment names were inventoried without printing values | No project `.env` file exists to inventory. Runtime names such as `OMNIROUTE_API_KEY`, `OMNIRUSH_ACCESS_TOKEN`, and `OMNIRUSH_TOKEN` were not copied into project configuration. |

## 3. Component boundaries and ownership

| Component | Responsibilities and owned data | Allowed side effects | Explicit boundary |
|---|---|---|---|
| **Dashboard** — Next.js/React/TypeScript | Tenant-scoped UI state, forms, inbox views, configuration screens, and API client types | HTTPS requests to the business API; browser uploads only through API-authorized URLs | It never connects directly to MySQL, Redis, Qdrant, the secret store, or provider APIs. A browser-supplied tenant ID is display/input data, not authorization. |
| **Business API** — Node.js/Fastify | Authentication/session enforcement, actor and tenant scope resolution, domain commands, queries, contract validation, and durable transactions | MySQL reads/writes; outbox creation; internal calls to the private AI service; enqueueing durable work | It validates untrusted input with Zod/OpenAPI and uses explicit tenant-scoped repositories. It does not trust tenant IDs from request bodies or query strings. |
| **Workers** — Node.js/BullMQ | Asynchronous domain work, connector polling/webhooks follow-up, indexing, exports, reconciliation, and retries | MySQL transactions; Redis queue coordination; verified connector calls; Qdrant derived-index updates; object-storage operations | A job must carry a trusted tenant/actor or system scope, idempotency key, and correlation ID. Workers re-read current consent, suppression, permissions, ownership, connector verification, and channel policy before an external effect. |
| **Durable database** — MySQL 8.4 LTS/InnoDB | Tenants, memberships, actors, connector metadata, conversations, messages, consent/suppression, policies, workflows, audit events, inbox/outbox, idempotency/effect receipts, export metadata, and trusted document/version metadata | Durable transactions and constraints | Every tenant-owned query goes through a repository requiring trusted scope. Same-tenant foreign keys and composite uniqueness prevent accidental cross-tenant references. No PostgreSQL RLS assumption. |
| **Private AI service** — Python/FastAPI | Bounded embeddings, retrieval computation, classification, generation, citations, and safety signals | Reads only through explicitly scoped internal requests; may query the private retrieval index if granted | It cannot write business tables, enqueue business side effects, call providers, send messages, place calls, or invoke tools. Its output is a proposal/result that Node validates and owns. |
| **Vector index** — Qdrant | Derived embeddings and searchable payload for approved document/message chunks | Qdrant upsert/delete/query through private service or Node indexing worker, according to the final implementation split | It is not authoritative. Payload filters include tenant and access scope; returned IDs and versions are checked against MySQL before use. It can be deleted and rebuilt. |
| **Object storage** — S3-compatible provider, choice TBD | Binary files, media, imports, exports, and derived artifacts | Authorized presigned upload/download and worker-managed lifecycle | MySQL owns metadata, tenant ownership, content hash, version, retention, and scan state. Object keys are opaque and tenant-scoped; possession of a URL is not a substitute for authorization. |
| **Connector adapters** — Node library/worker boundary | Provider-specific authentication, signature verification, normalization, capability discovery, rate limits, and provider error mapping | Only verified, explicitly enabled, policy-approved provider actions | An adapter must expose verification state and capability state separately. Configured, approved, verified, consented, and enabled are distinct states. |
| **Secret store/vault** — provider TBD | Provider tokens, signing secrets, encryption keys, and rotation material | Secret reads by the smallest service/action scope | MySQL stores only `secret_ref`, provider/account metadata, status, timestamps, and rotation metadata. Secrets never appear in logs, API responses, events, or database rows. |
| **Identity and access provider** — provider TBD | Authentication, session/claims, MFA/SSO policy where required | Token/session issuance | The authenticated identity is the input to tenant membership and actor scope resolution. Provider selection and claim shape are unresolved. |
| **Operations and audit** | Metrics, traces, structured logs, alerts, audit review, reconciliation queues, and runbooks | Read-only operational access plus approved remediation commands | Logs and traces use tenant/actor/correlation IDs where safe, never tokens or unnecessary message content. Operational access is itself tenant-scoped or explicitly break-glass audited. |

### Side-effect ownership rule

Only Node business code, normally the API transaction or a worker, can create durable business state or cause an external provider effect. The private Python service can return bounded computation. It must not send a message, make a call, mutate a provider account, write MySQL business tables, or claim that a provider effect occurred.

## 4. Data ownership and lifecycle

| Data | System of record | Derived/cached copies | Required controls |
|---|---|---|---|
| Tenant, user, membership, role, and policy | MySQL | None authoritative | Trusted identity-to-membership resolution; same-tenant constraints; audit changes. |
| Connector configuration and verification state | MySQL plus secret store for credentials | Provider-side account state and cached capability metadata | Connector ownership lookup; verification timestamp/status; secret reference only; periodic reconciliation. |
| Conversations, messages, assignments, consent, suppression, and delivery state | MySQL | Redis jobs, provider copies, search/vector projections | Tenant/actor scope on every read/write; inbox/outbox; effect receipts; no exactly-once claim. |
| Files and media | Object storage for bytes; MySQL for metadata | Thumbnails, OCR/text, embeddings | Tenant-scoped object key; content hash/version; malware/content scan; authorization before download/export. |
| Embeddings and retrieval payload | Qdrant as a derived index | None authoritative | Tenant/access/version payload filters; payload indexes; ownership/version verification in MySQL; rebuild and purge procedure. |
| AI response and safety result | MySQL when used in a business workflow | FastAPI request memory and logs with redaction | Store model/version and citations; treat model output as untrusted; Node controls persistence and delivery. |
| Queue/job coordination | Redis/BullMQ transient state | MySQL durable job/outbox records | Recreate jobs from durable records; idempotency; retries; dead-letter/reconciliation handling. |
| Audit trail | MySQL append-oriented audit records plus restricted log sink | SIEM/observability copy | Actor, tenant, action, target, result, correlation, and time; no secret values; retention policy to be defined. |

## 5. Request and event flows

### 5.1 Inbound provider webhook

1. Provider sends a webhook to a Node/Fastify ingress route.
2. The ingress verifies the provider signature, timestamp/replay rule, and connector identity.
3. Node maps the verified connector to its tenant in MySQL. Any tenant claim inside the payload is treated as untrusted and cannot select the tenant.
4. Node writes a durable inbox record and normalized domain event in one transaction, using the provider event ID for idempotency.
5. Node creates an outbox/job record. Redis receives only a coordination copy.
6. A worker processes the event through tenant-scoped repositories and updates MySQL. Ambiguous provider state enters reconciliation rather than being declared successful.

### 5.2 Outbound message or call

1. An authenticated actor or approved workflow asks the business API to create an intent.
2. Node resolves actor, tenant, conversation, connector, access policy, consent, suppression, channel policy, and human ownership from trusted records.
3. Node commits the intent and outbox record. The HTTP response reports durable acceptance, not external delivery.
4. A worker claims the outbox item with idempotency/effect-receipt protection.
5. Immediately before the provider call, the worker rechecks current permission, consent, suppression, channel policy, connector verification, and calling capability flags.
6. The verified adapter performs the provider effect. Node records provider response or an ambiguous outcome.
7. Reconciliation resolves unknown outcomes using provider-supported status lookup or a human/operator queue. Delivery remains at-least-once and may require provider-specific deduplication.

### 5.3 AI and retrieval

1. Node creates an internal request using a trusted tenant/actor scope, allowed resource IDs or access filters, policy version, correlation ID, and short expiry.
2. FastAPI validates the bounded request and performs embedding, retrieval, classification, or generation. Qdrant queries always include tenant and access filters.
3. FastAPI returns candidate IDs, index/model versions, citations, safety signals, and/or a proposed response. It does not authorize an external action.
4. Node verifies every candidate's owner, access, and content version against MySQL. Stale, deleted, or mismatched candidates are discarded.
5. Node decides whether to persist, present to a human, or enqueue a separately authorized action. AI output alone never sends or calls.

## 6. Tenant and actor isolation model

MySQL does not provide an assumed PostgreSQL-style row-level-security safety net in this design. Isolation is enforced in application and schema layers:

- A trusted request context is created from the authenticated identity and verified connector ownership. It contains `tenant_id`, `actor_id` or system actor, roles/permissions, and correlation metadata.
- Repository constructors require that context; tenant-owned methods do not accept an arbitrary tenant ID as an authorization parameter.
- Tenant-owned rows have a non-null `tenant_id`. Relations that reference tenant-owned rows use same-tenant composite foreign keys where MySQL permits them; application checks backstop boundaries that cannot be expressed as constraints.
- Unique keys, indexes, and queries include `tenant_id` where the business identity is tenant-local.
- Jobs, events, exports, files, streams, tool proposals, and search requests carry trusted scope. Missing or ambiguous scope fails closed.
- The client may select a tenant only where the authenticated identity has an authorized membership and the API has resolved that membership. A body/header/query tenant ID is never sufficient.
- Cross-tenant isolation tests use at least two tenants and verify reads, writes, jobs, inbox/outbox records, vector results, files, exports, live streams, and provider mappings.

## 7. Contract freeze (high level)

### 7.1 Public business API `/api/v1`

The API is versioned under `/api/v1`. Exact routes are staged later, but all routes follow these rules:

- Authentication is required except explicitly documented health, provider challenge, or public form ingress routes.
- Public form and webhook routes have separate signature/rate-limit/replay protections and never expose a general tenant selector.
- `Authorization`, `Idempotency-Key` for mutation retries, and `X-Correlation-Id` are transport concerns. Header names and validation are defined in the OpenAPI document.
- Request path/query/header/body schemas are validated before domain code runs. Zod schemas are the TypeScript runtime source for the external shape; OpenAPI is the published interface description and is checked for drift.
- Success responses include a stable resource representation or an explicit durable-acceptance result. They do not claim external delivery unless a verified provider receipt supports that claim.
- Errors use a stable envelope:

  ```json
  {
    "error": {
      "code": "stable_machine_code",
      "message": "safe human-readable message",
      "details": {},
      "request_id": "uuid"
    }
  }
  ```

- `details` is safe, bounded, and never contains provider tokens, secret values, SQL, or cross-tenant existence information.

### 7.2 Event envelope v1

Internal domain and integration events use a durable envelope. `tenant_id` is written only after Node resolves trusted scope; it is not an authorization input from an external payload.

```json
{
  "event_id": "uuid",
  "event_type": "conversation.message.received",
  "schema_version": 1,
  "occurred_at": "RFC-3339 timestamp",
  "tenant_id": "uuid",
  "actor": { "type": "user|system|connector", "id": "uuid-or-provider-id" },
  "source": { "service": "business-api|worker|connector", "connector_id": "uuid-or-null" },
  "correlation_id": "uuid",
  "causation_id": "uuid-or-null",
  "idempotency_key": "bounded string",
  "payload": {}
}
```

Required behavior:

- Consumers validate `schema_version` and `event_type` before handling.
- Inbox deduplicates provider/event delivery by provider event ID and connector scope.
- Outbox records are committed with the business transaction before queue publication.
- Consumers are idempotent and safe to retry. Ordering is only claimed where a provider/domain key and durable sequencing support it.
- Events do not contain plaintext secrets. Sensitive payload fields are minimized or referenced by durable IDs.

### 7.3 Private AI-service contract

The FastAPI service is private-network only and authenticated service-to-service. Initial high-level operations are:

- `POST /internal/v1/retrieval/query`: accepts a bounded query, trusted scope, explicit access filters, allowed resource/version constraints, model/index version preferences, and a result limit. Returns candidate resource/chunk IDs, scores, citations, index version, and filtering metadata.
- `POST /internal/v1/embeddings/compute`: accepts bounded, sanitized content plus tenant/resource/version metadata needed for correlation. Returns embeddings and model/version metadata. The caller, not Python, writes the derived index.
- `POST /internal/v1/generation/respond`: accepts a bounded prompt plus Node-approved context references and policy flags. Returns proposed text, citations, safety flags, model/version metadata, and non-executable tool proposals. It does not send, call, or persist business state.
- `GET /internal/v1/health`: reports service health without tenant data.

The private contract must reject oversized inputs, unknown resource types, expired scope, and missing access filters. Node remains the authorization and side-effect boundary.

## 8. Configuration and capability model

Tenant configuration is versioned data, not code:

- `tenant_settings` controls branding, timezone, retention, feature flags, and approved channel policy.
- `connector_accounts` records provider/account identity, tenant ownership, verification status, capability status, secret reference, and last reconciliation time.
- `channel_capabilities` separates `whatsapp_messaging`, `whatsapp_calling`, `pstn_calling`, and `managed_ai_voice`.
- `consent_records` and `suppression_records` are current policy inputs, not static onboarding fields.
- Calling flags default to disabled at tenant, connector, workflow, and worker-adapter levels. A configured connector cannot bypass provider approval, consent, permissions, safety policy, or missing verification.

Feature configuration cannot enable an unverified provider integration. Any capability assessment produces an evidence record and a go/no-go decision before implementation of live effects.

## 9. Version and integration evidence

These are planning inputs verified on 2026-10-09, not a substitute for lockfiles or provider approval.

| Technology/claim | Evidence observed | Planning decision |
|---|---|---|
| Node.js | Official release page identifies Node 24 as LTS and Node 26 as Current. Local runtime is Node `v26.10.0`. | Use an even-numbered LTS baseline for production; pin the exact Node 24 patch in Stage 02 after CI image selection. Local Node 26 is not a production compatibility result. |
| Next.js | Official installation docs were accessible; page identifies Next.js docs version `16.4.0`, minimum Node `20.9`, and minimum TypeScript `5.1.0`. | Use the current stable Next.js line compatible with the pinned Node LTS; exact package versions are deferred to the first manifest/lockfile. |
| Fastify | Official TypeScript docs were accessible and rendered latest Fastify `v5.12.5`; docs describe route schemas and TypeScript support. | Use Fastify 5 and schema-first route definitions; pin exact package versions in Stage 02. |
| BullMQ/Redis | Official BullMQ docs describe a Node.js queue system built on Redis, retries, workers, and idempotent-job patterns. | Use BullMQ for coordination only. Durable job/outbox state remains in MySQL. Exact BullMQ and Redis deployment versions are unpinned. |
| Zod | Official Zod docs identify Zod 4.6, TypeScript-first validation, JSON Schema conversion, and TypeScript 5.5+ tested support. | Use Zod 4 with `strict` TypeScript. Validate at every external trust boundary. |
| OpenAPI | Official specification page identifies published OpenAPI Specification `3.2.1` dated 2026-09-10. | Publish a version supported by the chosen Fastify/Zod toolchain; prefer OAS 3.1 for initial interoperability unless Stage 02 proves the selected tooling supports OAS 3.2.1. |
| FastAPI | Official docs were accessible and describe FastAPI as standards-based with OpenAPI/JSON Schema and Pydantic validation. | Use FastAPI for private bounded computation. Exact FastAPI/Python versions require a Python manifest and CI compatibility check. |
| Qdrant | Official filtering, multitenancy, and indexing docs were accessible. They describe payload filters, tenant indexes, access-filter composition, and strict mode for unindexed filters. | Store tenant/access/version payload fields, create payload indexes before ingestion, and fail closed on missing access filters. Exact Qdrant version is unpinned. |
| MySQL 8.4 LTS/InnoDB | Official MySQL pages attempted from this environment returned HTTP 403, so current support and feature details were not independently verified here. The 8.4 LTS/InnoDB target is a user-mandated architecture constraint. | Keep MySQL 8.4 LTS/InnoDB as the target. Verify vendor support, server image, and constraint behavior during Stage 02 before production use. |
| Security baseline | OWASP ASVS official page was accessible and identifies stable version 5.0.0 as a basis for testing web-application security controls. | Use versioned ASVS 5.0.0 controls as the security review baseline; map controls in Stage 15. |
| Meta channels | Official Meta documentation fetch attempts returned non-2xx responses (400/404) from this environment. No API version, capability, approval, or sandbox claim is accepted from this pass. | Facebook Lead Ads, Instagram messaging, Messenger, WhatsApp messaging, and WhatsApp Calling remain unverified and pending provider/account validation. |

## 10. Assumptions, unknowns, and external prerequisites

### Assumptions

- A shared MySQL database is acceptable for the initial multi-tenant deployment, with explicit schema and repository isolation.
- Tenants share product code and can vary through versioned configuration, policy, capabilities, templates, and connector metadata.
- The platform can require provider sandbox/test accounts before enabling any connector in staging.
- Human ownership and suppression policies take precedence over AI or workflow suggestions.
- Qdrant data can be rebuilt from MySQL/object-storage source records.

### Unknowns requiring a decision

- Identity provider, claims, MFA/SSO needs, and account recovery policy.
- Deployment/cloud target, region, data residency, backup provider, and disaster-recovery objectives.
- Secret manager/vault selection, rotation SLA, and break-glass process.
- Object-storage provider, malware scanning, media retention, and maximum file sizes.
- MySQL migration tool, schema naming convention, connection pooling, backup/restore procedure, and tenant-volume limits.
- Exact provider account ownership model, Meta app/business verification state, scopes, webhook subscriptions, rate limits, and sandbox availability.
- WhatsApp Business Account and phone-number prerequisites, template approval, messaging windows, and regional policy.
- Whether any provider supports the desired calling capability for the target region/account class. WhatsApp Calling must be assessed separately from WhatsApp messaging.
- PSTN/Exotel or managed AI voice provider, recording/consent rules, telephony geography, caller ID, emergency-call restrictions, and human escalation policy.
- AI model/provider, data residency, retention/training settings, model evaluation set, prompt-injection controls, and per-tenant budgets.
- Analytics definitions, retention, export format, privacy requests, and reporting owners.

### Required external/account prerequisites

These are gates, not claims that access or approval already exists:

- At least two synthetic test tenants and test actors for isolation tests.
- A local or staging MySQL 8.4/InnoDB instance, Redis, Qdrant, object-storage bucket, and secret-store namespace.
- A Meta developer app/business and test assets with the required product permissions and webhook verification, subject to Meta approval.
- A WhatsApp Business Account, test phone number, approved templates, and messaging test plan for WhatsApp messaging.
- A separate documented feasibility/approval result for WhatsApp Calling.
- A separate provider account, legal/consent review, number, and test environment for PSTN/managed AI voice.
- A staging deployment with private network access from Node to FastAPI/Qdrant and no production provider credentials.

## 11. Operational ownership and test environments

| Area | Provisional owner | Expected environment/evidence |
|---|---|---|
| Product scope and tenant configuration | Product + Customer Success | Staging tenant fixtures; configuration review; onboarding checklist. |
| Business API, MySQL, repositories, contracts | Platform/API engineering | Local Docker and CI MySQL 8.4; contract tests; migration rehearsal. |
| Connector verification and provider accounts | Integration/Partner Operations | Provider sandboxes/test assets; webhook replay fixtures; approval evidence. |
| Human inbox and assignment policy | Conversation Operations | Staging users/roles; two-tenant assignment tests; manual takeover scenarios. |
| AI/RAG and model safety | AI/Retrieval engineering + Security | Private staging FastAPI/Qdrant; red-team prompts; citation/version tests; no provider side effects. |
| Security and privacy | Security/Privacy owner | ASVS-based review, secret rotation drill, access review, export/deletion review. |
| Reliability, backups, reconciliation, and incident response | SRE/Operations | Local failure injection, staging restore, queue outage, provider timeout, and ambiguous-result drills. |
| Release/deployment | Platform/SRE | CI, staging canary, migration rollback rehearsal, production change record. |

## 12. Delivery plan and release gates

The authoritative initial stage sequence is in [`stage-index.md`](stage-index.md) and [`decisions/ADR-0002-stage-sequence.md`](decisions/ADR-0002-stage-sequence.md). The current sequence is:

1. **Stage 01:** architecture, ADR, requirements coverage, and evidence freeze.
2. **Stage 02:** repository/tooling foundation, identity boundary, tenant/actor context, and contract tooling.
3. **Stage 03:** quality gates and stage evidence.
4. **Stage 04:** versioned API, event, and configuration contracts.
5. **Stage 05:** MySQL and migration discipline.
6. **Stage 06:** authentication and tenant membership.
7. **Stage 07:** authorization and controlled support access.
8. **Stage 08:** secret storage and per-client credential references.
9. **Stage 09:** tenant provisioning and lifecycle.
10. **Stage 10:** contact, identity, and lead records.

The full approved 72-prompt blueprint is now present as `No_Code_Platform_Development_Promptbook.pdf` and is reconciled in [`recovery/architecture-reconciliation.md`](recovery/architecture-reconciliation.md). The promptbook governs the canonical 01–72 stage sequence. The earlier feature map and conflicting reference details are preserved as superseded evidence under `docs/recovery/`.

No live sends, imports, calls, account changes, or production migrations are enabled by this document.

## 13. Risks and mitigations

| Risk | Mitigation/gate |
|---|---|
| Application-level tenant isolation regression | Required tenant context, repository APIs, same-tenant constraints, two-tenant tests, and security review before release. |
| Redis loss or duplicate jobs | MySQL outbox/job records, idempotency/effect receipts, replayable workers, and reconciliation. |
| Stale or poisoned vector result | Tenant/access filter in Qdrant plus MySQL owner/version verification and rebuild procedure. |
| AI output causes unauthorized side effect | Python has no provider/business-write capability; Node validates and rechecks policy before any effect. |
| Provider approval or API capability changes | Capability registry, verified status, sandbox tests, provider version records, adapter contract tests, and feature-off defaults. |
| Ambiguous external provider response | Persist pending/unknown effect state and reconcile; never report exactly-once delivery. |
| Secret leakage | Secret references only in MySQL, vault access at effect boundary, log redaction, rotation drill, and no secret-bearing events. |
| Calling safety or regulatory failure | Separate capability flags and assessment; disabled by default; consent, recording, regional, escalation, and provider gates. |

## 14. Reassessment triggers

Re-open this architecture before implementation of a later stage if the deployment target requires a different database, if a provider cannot support the stated capability, if tenant scale requires sharding/separate databases, if Qdrant cannot satisfy access filtering, if the identity model changes, or if the private AI boundary needs a side effect not allowed here.

## 15. Primary sources checked

- [Node.js releases](https://nodejs.org/en/about/previous-releases) — accessible; LTS/current release policy and branch status.
- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) — accessible; system requirements and TypeScript guidance.
- [Fastify TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/) — accessible; TypeScript and schema-validation guidance.
- [BullMQ](https://docs.bullmq.io/) — accessible; Redis-backed workers, retries, and idempotent-job patterns.
- [FastAPI](https://fastapi.tiangolo.com/) — accessible; validation and OpenAPI/JSON Schema positioning.
- [Zod](https://zod.dev/) — accessible; Zod 4, TypeScript-first validation, JSON Schema conversion, and TypeScript support.
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) — accessible; published specification version and contract semantics.
- [Qdrant filtering](https://qdrant.tech/documentation/search/filtering/) — accessible; boolean filters and payload filtering.
- [Qdrant multitenancy](https://qdrant.tech/documentation/manage-data/multitenancy/) — accessible; payload partitioning and tenant isolation patterns.
- [Qdrant indexing](https://qdrant.tech/documentation/manage-data/indexing/) — accessible; payload/tenant indexes and strict filtering behavior.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — accessible; versioned security verification baseline.
- MySQL official documentation/support pages — attempted but returned HTTP 403 from this environment; MySQL details remain unverified here.
- Meta developer documentation — attempted but returned non-2xx responses from this environment; channel capability and approval claims remain unverified.
