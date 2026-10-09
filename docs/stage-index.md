# Canonical stage index

This is the machine-readable planning index for the approved prompt sequence. The canonical source is `No_Code_Platform_Development_Promptbook.pdf`, verified at the project root on 2026-10-10. The promptbook defines all 72 stages; this index does not invent additional stage numbers. `verification_status` contains only the official verification values (or `null` when no result exists); `execution_state` records progress separately.

| Stage | Scope | Verification status | Execution state | Prerequisite stage | Required implementation evidence |
|---:|---|---|---|---:|---|
| 01 | Architecture and requirements | `technically_verified_pending_external` | `completed` | — | Architecture, ADR, matrix, and audit evidence. |
| 02 | Repository and local environment | `null` | `interrupted` | 01 | Workspace manifests, source processes, local dependencies, lockfiles, health/readiness, and runtime checks. |
| 03 | Quality gates and stage evidence | `failed` | `completed` | 02 | Executable lint/format/type/test/CI/browser gates, synthetic fixtures, fake adapters, and isolation tests. |
| 04 | Versioned API, event, and configuration contracts | `failed` | `completed` | 03 | Zod contracts, compatible schemas/models, fixtures, OpenAPI, and compatibility tests. |
| 05 | MySQL and migration discipline | `failed` | `completed` | 04 | Prisma/MySQL pin, migrations, scoped repositories, transaction tests, and migration evidence. |
| 06 | Authentication and tenant membership | `failed` | `completed` | 05 | OIDC/session implementation, membership state, revocation, CSRF, session, and tenant-switch tests. |
| 07 | Authorization and controlled support access | `failed` | `completed` | 06 | Permission matrix, reusable authorization service, support grants, scoped principals, and denial tests. |
| 08 | Secret storage and per-client credential references | `failed` | `completed` | 07 | Secret-store adapter, metadata model, fake store, rotation/revocation, and leakage tests. |
| 09 | Tenant provisioning and lifecycle | `null` | `not_started` | 08 | Provisioning workflow, lifecycle state, tenant-scoped fixtures, and rollback evidence. |
| 10 | Contact, identity, and lead records | `null` | `not_started` | 09 | Contact/identity/lead records, same-tenant constraints, deduplication, and scoped tests. |
| 11 | Consent and suppression | `null` | `not_started` | 10 | Consent/suppression records, precedence rules, audit evidence, and denial tests. |
| 12 | Provider registry and assignment | `null` | `not_started` | 11 | Connector registry, ownership, assignment, capability state, and verification model. |
| 13 | Conversation store | `null` | `not_started` | 12 | Conversation/message persistence, participant identity, tenant scope, and history tests. |
| 14 | Inbox and outbox | `null` | `not_started` | 13 | Durable inbox/outbox, provider event deduplication, effect intent, and replay evidence. |
| 15 | Redis and BullMQ execution | `null` | `not_started` | 14 | Durable job records, queue workers, retries, dead-letter handling, and idempotency tests. |
| 16 | Audit, idempotency, and export primitives | `null` | `not_started` | 15 | Audit events, idempotency/effect receipts, export metadata, and scoped access tests. |
| 17 | Dashboard foundation | `null` | `not_started` | 16 | Authenticated tenant-scoped shell, API client, navigation, and UI boundary tests. |
| 18 | Versioned configuration publishing | `null` | `not_started` | 17 | Draft/publish/version model, immutable published configuration, and rollback evidence. |
| 19 | Onboarding and profile configuration | `null` | `not_started` | 18 | Client onboarding/profile settings, policy defaults, validation, and audit evidence. |
| 20 | Forms and public intake | `null` | `not_started` | 19 | Public intake contracts, rate/replay protection, lead creation, and abuse tests. |
| 21 | Routing editor | `null` | `not_started` | 20 | Tenant-scoped routing rules, validation, preview, and safe publish behavior. |
| 22 | Workflow language | `null` | `not_started` | 21 | Versioned workflow grammar, validation, compatibility, and non-executable preview. |
| 23 | Workflow execution | `null` | `not_started` | 22 | Durable workflow runs, policy checks, retries, idempotency, and audit evidence. |
| 24 | Workflow UI | `null` | `not_started` | 23 | Workflow editor, validation feedback, versioning, and tenant-scoped UI tests. |
| 25 | Connector registry | `null` | `not_started` | 24 | Provider metadata, verification/capability state, secret references, and reconciliation. |
| 26 | Communication policy and intent | `null` | `not_started` | 25 | Channel policy, consent/suppression checks, durable intent, and pre-effect gates. |
| 27 | Meta readiness | `null` | `not_started` | 26 | Meta app/account prerequisites, permission evidence, test assets, and go/no-go record. |
| 28 | Embedded Signup | `null` | `not_started` | 27 | Signup flow, callback verification, tenant mapping, secret reference, and failure tests. |
| 29 | Phone onboarding | `null` | `not_started` | 28 | Phone/WABA onboarding state, verification, ownership, and capability evidence. |
| 30 | Webhook foundation | `null` | `not_started` | 29 | Signature/replay validation, connector mapping, durable inbox, and replay tests. |
| 31 | Lead Ads ingestion | `null` | `not_started` | 30 | Lead Ads adapter, field mapping, deduplication, consent, and tenant isolation tests. |
| 32 | Normalization and routing | `null` | `not_started` | 31 | Provider normalization, routing decisions, idempotency, and scoped event tests. |
| 33 | WhatsApp outbound | `null` | `not_started` | 32 | Verified outbound adapter, templates, policy gates, receipts, and sandbox evidence. |
| 34 | WhatsApp inbound | `null` | `not_started` | 33 | Inbound normalization, conversation updates, deduplication, and policy tests. |
| 35 | Template, media, and health | `null` | `not_started` | 34 | Template/media state, connector health, reconciliation, and failure evidence. |
| 36 | Instagram messaging | `null` | `not_started` | 35 | Verified Instagram adapter, inbound/outbound contracts, policy, and sandbox evidence. |
| 37 | Messenger | `null` | `not_started` | 36 | Verified Messenger adapter, event handling, policy, and sandbox evidence. |
| 38 | Website forms and import | `null` | `not_started` | 37 | Form/import contracts, duplicate handling, validation, and safe tenant-scoped writes. |
| 39 | Human inbox | `null` | `not_started` | 38 | Assignment, takeover, live updates, audit, and two-tenant access tests. |
| 40 | Lead and provider workspaces | `null` | `not_started` | 39 | Scoped operational views, provider state, assignment, and audit evidence. |
| 41 | Private Python AI service | `null` | `not_started` | 40 | Private service boundary, authentication, bounded inputs, health, and no-side-effect tests. |
| 42 | Knowledge model | `null` | `not_started` | 41 | Tenant knowledge resources, versions, access policy, ingestion state, and audit. |
| 43 | Qdrant indexing | `null` | `not_started` | 42 | Derived index writes, tenant/access/version payloads, rebuild, purge, and consistency tests. |
| 44 | Retrieval and RAG | `null` | `not_started` | 43 | Filtered retrieval, MySQL ownership/version verification, citations, and injection tests. |
| 45 | Memory | `null` | `not_started` | 44 | Scoped memory lifecycle, retention, consent, retrieval, and deletion tests. |
| 46 | Semantic cache | `null` | `not_started` | 45 | Tenant/policy/model-version cache keys, invalidation, and leakage tests. |
| 47 | AI tools | `null` | `not_started` | 46 | Non-executable tool proposals, Node authorization, confirmations, and audit evidence. |
| 48 | AI chat | `null` | `not_started` | 47 | Scoped AI chat, citations, safety signals, human handoff, and no-side-effect tests. |
| 49 | Voice readiness | `null` | `not_started` | 48 | Voice capability model, consent/recording policy, provider gates, and go/no-go evidence. |
| 50 | Exotel/PSTN | `null` | `not_started` | 49 | Verified PSTN adapter, number/region policy, effect receipts, and sandbox evidence. |
| 51 | Managed voice | `null` | `not_started` | 50 | Managed AI voice boundary, consent, escalation, recordings, and provider evidence. |
| 52 | Call outcomes | `null` | `not_started` | 51 | Call state/outcome records, reconciliation, summaries, and scoped audit evidence. |
| 53 | Qualification | `null` | `not_started` | 52 | Qualification rules, AI proposals, human review, versioning, and audit evidence. |
| 54 | Scheduling and campaigns | `null` | `not_started` | 53 | Scheduling/campaign policy, consent, durable jobs, suppression, and retry evidence. |
| 55 | Outbound integrations | `null` | `not_started` | 54 | Verified external adapters, capability state, policy gates, and reconciliation. |
| 56 | Delivery packages | `null` | `not_started` | 55 | Tenant delivery/export package, manifests, redaction, integrity, and rollback evidence. |
| 57 | Data retention | `null` | `not_started` | 56 | Retention/deletion policies, legal holds, derived-index purge, and audit evidence. |
| 58 | Hardening | `null` | `not_started` | 57 | Security hardening, abuse limits, secret controls, dependency checks, and review. |
| 59 | Usage | `null` | `not_started` | 58 | Tenant usage metering, quotas, idempotency, aggregation, and access controls. |
| 60 | Analytics | `null` | `not_started` | 59 | Metric definitions, tenant-scoped analytics, lineage, retention, and export tests. |
| 61 | Monitoring and recovery | `null` | `not_started` | 60 | Metrics, traces, alerts, reconciliation, runbooks, and failure drills. |
| 62 | Deployment infrastructure | `null` | `not_started` | 61 | Environment configuration, private networking, rollout, secrets, and deployment evidence. |
| 63 | Backups | `null` | `not_started` | 62 | Backup/restore, encryption, retention, tenant recovery, and restore drills. |
| 64 | Growth | `null` | `not_started` | 63 | Scale limits, capacity controls, onboarding throughput, and operational evidence. |
| 65 | AI evaluation | `null` | `not_started` | 64 | Evaluation set, quality/safety thresholds, regression checks, and model/version records. |
| 66 | Official channel acceptance | `null` | `not_started` | 65 | Provider acceptance, permissions, webhooks, templates, and capability go/no-go records. |
| 67 | Failure and load testing | `null` | `not_started` | 66 | Load, queue outage, provider timeout, duplicate, isolation, and recovery evidence. |
| 68 | Journeys and usability | `null` | `not_started` | 67 | End-to-end tenant journeys, accessibility, usability, and human takeover evidence. |
| 69 | Release and security | `null` | `not_started` | 68 | Release checklist, security review, migration rehearsal, rollback, and sign-off. |
| 70 | Export and transfer | `null` | `not_started` | 69 | Tenant export/transfer, authorization, integrity, redaction, and deletion evidence. |
| 71 | Pilot | `null` | `not_started` | 70 | Controlled pilot, feedback, incidents, rollback plan, and acceptance record. |
| 72 | Second client | `null` | `not_started` | 71 | Second-tenant delivery, isolation, configurability, support, and repeatability evidence. |

## Source and status rules

- Stages and scope come from the verified promptbook PDF; the detailed evidence column is the repository's acceptance interpretation.
- `failed` on Stages 03–08 preserves historical prerequisite failures. It does not mean their implementation was attempted successfully.
- Stage 02 has a partial scaffold but no verification result, so it remains `interrupted` with `verification_status: null`.
- The three canonical statuses are defined in `docs/decisions/ADR-0002-stage-sequence.md`; progress metadata is descriptive and is not a stage status.
- Historical report references are immutable evidence; they are not copied into current verification status. The validator supports optional separated `historicalEvidence` metadata for programmatic records.
- Historical feature mappings in `docs/recovery/superseded-requirements-to-stages.md` remain preserved and are not executable assignments.
