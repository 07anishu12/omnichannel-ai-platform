# Architecture and stage reconciliation

**Reconciliation status:** approved; Stage 01 documentation acceptance completed
**Reviewed:** 2026-10-10
**Repository root:** `/Users/anny/Desktop/omnichannel`
**Scope:** Compare the two supplied PDFs and the current master implementation instructions with the current architecture, stage index, ledger, requirements matrix, and historical reports. No application behavior, database schema, provider integration, or production resource was changed by this reconciliation.

## 1. Source inventory and reading result

Both PDFs were present at the confirmed project root, were readable, and were inspected for text and embedded page diagrams. `pdfinfo` reported the following:

| File | PDF metadata title | Pages | Reading result | Use in this reconciliation |
|---|---|---:|---|---|
| `No_Code_Platform_Development_Promptbook.pdf` | `Multi-client No-code Platform - 72 Development Prompts` | 48 | Text and page images readable; Prompt 00, the 72-prompt index, and prompt pages were inspected. | **Primary authority** for stack/configuration decisions and numbered stage definitions. |
| `Omnichannel_Architecture_Illustrated_Guide.pdf` | `Omnichannel Lead Platform - Illustrated Guide and Engineering Blueprint` | 217 | Text and page images readable; architecture, contract, data-model, prompt, and diagram sections were inspected. | Detailed conceptual/reference material where compatible with the primary authority. |

Text extraction preserves all pages but does not preserve PDF layout. A few extracted phrases join adjacent words or numbers, and diagram labels are more reliable in the rendered page images. No missing page, encrypted document, or unreadable diagram was found during inspection.

## 2. Authority decision

The promptbook is the canonical architecture/stage source because its Prompt 00 and preflight pages explicitly state that it is the new stack/configuration authority and that earlier conceptual material is usable only where compatible. The guide is retained as useful explanatory and design evidence, but a conflicting guide detail cannot override the promptbook. The newly supplied master implementation prompt is the current process authority for repository operation, publication, and stage-status semantics.

This decision resolves the earlier repository blocker: the full 72-prompt blueprint is now available locally. It does not turn any stage into implemented or verified work.

### Adopted architecture baseline

The current architecture remains aligned with the promptbook baseline:

- One reusable multi-client product with tenant behavior represented by versioned configuration and policy data.
- Next.js/React/TypeScript dashboard.
- Node.js/Fastify business API with boundary validation and versioned contracts.
- Node.js workers using BullMQ and Redis for coordination only; durable business state remains in MySQL.
- MySQL 8.4 LTS/InnoDB as the durable business store, with explicit tenant scope and same-tenant relationship constraints.
- Private Python/FastAPI service for bounded AI, embedding, retrieval, classification, and generation computation only.
- Qdrant as a rebuildable derived vector index with tenant/access/version filters and MySQL ownership/version verification.
- Secret-manager or vault references in MySQL; plaintext provider credentials never enter application data, logs, events, or API responses.
- Verified connector adapters, durable inbox/outbox records, idempotency/effect receipts, reconciliation, and disabled-by-default calling.

The guide's compatible principles—modular boundaries, explicit state machines, durable event flows, capability gating, provider verification, and human takeover—remain design guidance. Its conflicting PostgreSQL/pgvector implementation details are not adopted.

## 3. Canonical 72-stage sequence

The following sequence is transcribed from the promptbook's 72-prompt index. The table records the pre-status-model-correction recovery snapshot; the authoritative current `verification_status` and `execution_state` fields are in `docs/stage-index.md` and `docs/stage-ledger.md`.

| Stage | Canonical scope | Prerequisite | Current status |
|---:|---|---:|---|
| 01 | Architecture and requirements | — | `technically_verified_pending_external` |
| 02 | Repository and local environment | 01 | `in_progress` |
| 03 | Quality gates and stage evidence | 02 | `failed` |
| 04 | Versioned API, event, and configuration contracts | 03 | `failed` |
| 05 | MySQL and migration discipline | 04 | `failed` |
| 06 | Authentication and tenant membership | 05 | `failed` |
| 07 | Authorization and controlled support access | 06 | `failed` |
| 08 | Secret storage and per-client credential references | 07 | `failed` |
| 09 | Tenant provisioning and lifecycle | 08 | `planned` |
| 10 | Contact, identity, and lead records | 09 | `planned` |
| 11 | Consent and suppression | 10 | `planned` |
| 12 | Provider registry and assignment | 11 | `planned` |
| 13 | Conversation store | 12 | `planned` |
| 14 | Inbox and outbox | 13 | `planned` |
| 15 | Redis and BullMQ execution | 14 | `planned` |
| 16 | Audit, idempotency, and export primitives | 15 | `planned` |
| 17 | Dashboard foundation | 16 | `planned` |
| 18 | Versioned configuration publishing | 17 | `planned` |
| 19 | Onboarding and profile configuration | 18 | `planned` |
| 20 | Forms and public intake | 19 | `planned` |
| 21 | Routing editor | 20 | `planned` |
| 22 | Workflow language | 21 | `planned` |
| 23 | Workflow execution | 22 | `planned` |
| 24 | Workflow UI | 23 | `planned` |
| 25 | Connector registry | 24 | `planned` |
| 26 | Communication policy and intent | 25 | `planned` |
| 27 | Meta readiness | 26 | `planned` |
| 28 | Embedded Signup | 27 | `planned` |
| 29 | Phone onboarding | 28 | `planned` |
| 30 | Webhook foundation | 29 | `planned` |
| 31 | Lead Ads ingestion | 30 | `planned` |
| 32 | Normalization and routing | 31 | `planned` |
| 33 | WhatsApp outbound | 32 | `planned` |
| 34 | WhatsApp inbound | 33 | `planned` |
| 35 | Template, media, and health | 34 | `planned` |
| 36 | Instagram messaging | 35 | `planned` |
| 37 | Messenger | 36 | `planned` |
| 38 | Website forms and import | 37 | `planned` |
| 39 | Human inbox | 38 | `planned` |
| 40 | Lead and provider workspaces | 39 | `planned` |
| 41 | Private Python AI service | 40 | `planned` |
| 42 | Knowledge model | 41 | `planned` |
| 43 | Qdrant indexing | 42 | `planned` |
| 44 | Retrieval and RAG | 43 | `planned` |
| 45 | Memory | 44 | `planned` |
| 46 | Semantic cache | 45 | `planned` |
| 47 | AI tools | 46 | `planned` |
| 48 | AI chat | 47 | `planned` |
| 49 | Voice readiness | 48 | `planned` |
| 50 | Exotel/PSTN | 49 | `planned` |
| 51 | Managed voice | 50 | `planned` |
| 52 | Call outcomes | 51 | `planned` |
| 53 | Qualification | 52 | `planned` |
| 54 | Scheduling and campaigns | 53 | `planned` |
| 55 | Outbound integrations | 54 | `planned` |
| 56 | Delivery packages | 55 | `planned` |
| 57 | Data retention | 56 | `planned` |
| 58 | Hardening | 57 | `planned` |
| 59 | Usage | 58 | `planned` |
| 60 | Analytics | 59 | `planned` |
| 61 | Monitoring and recovery | 60 | `planned` |
| 62 | Deployment infrastructure | 61 | `planned` |
| 63 | Backups | 62 | `planned` |
| 64 | Growth | 63 | `planned` |
| 65 | AI evaluation | 64 | `planned` |
| 66 | Official channel acceptance | 65 | `planned` |
| 67 | Failure and load testing | 66 | `planned` |
| 68 | Journeys and usability | 67 | `planned` |
| 69 | Release and security | 68 | `planned` |
| 70 | Export and transfer | 69 | `planned` |
| 71 | Pilot | 70 | `planned` |
| 72 | Second client | 71 | `planned` |

### First executable repair sequence

The safe repair order is unchanged through the foundation:

1. Keep Stage 01 as documentation-only and pending external/vendor evidence.
2. Finish and verify Stage 02 repository/local-environment evidence, without adding feature behavior.
3. Re-run Stage 03 quality gates and evidence against the real Stage 02 foundation.
4. Re-run Stage 04 contracts only after Stage 03 passes.
5. Continue one verified prerequisite at a time; do not retry historical Stages 06–08 in parallel.

The existing Stage 02 scaffold is an interrupted, unverified work tree. It is not evidence that Stage 02 passed, and no `docs/stages/02.md` report exists yet.

## 4. Conflict register

| ID | Conflict | Evidence | Proposed resolution | Decision state |
|---|---|---|---|---|
| C-01 | Database and vector stack | Promptbook pages 3–4 specify MySQL 8.4/InnoDB and Qdrant. Guide pages 6, 24, 53, 56, and its schema sections use PostgreSQL and pgvector. | Use MySQL 8.4/InnoDB and Qdrant. Treat the guide's PostgreSQL DDL, RLS assumptions, JSONB types, and pgvector procedures as superseded examples requiring a future MySQL/Qdrant rewrite. | Resolved by source authority. |
| C-02 | Stage numbering | Promptbook pages 8–14 provide the complete 72-stage sequence. Current docs previously stopped at Stage 10 because the blueprint was absent. | Make the promptbook sequence canonical for Stages 01–72 and preserve historical reports unchanged. | Resolved. |
| C-03 | Product scope | Promptbook pages 2–6 describe one reusable multi-client product and configurable client delivery. The guide includes an own-business MVP/one-portfolio framing and defers broader SaaS concerns in places. | Use the promptbook's multi-client scope. Use the guide's journey and design material only where it supports reusable tenant configuration and isolation. | Resolved by source authority. |
| C-04 | Prompt/stage granularity | The guide contains a separate 22-prompt implementation plan, while the promptbook contains 72 numbered prompts. | The 72 promptbook stages govern the ledger and matrix. The guide's 22 prompts are explanatory groupings, not additional or competing stage numbers. | Resolved. |
| C-05 | Stage statuses | The master implementation prompt mandates only `verified`, `technically_verified_pending_external`, and `failed`, while execution progress needs separate lifecycle values. | Use `verification_status` for the three official results and required `execution_state` for `not_started`, `in_progress`, `interrupted`, or `completed`. Use `null` verification status when no result exists; preserve an existing official result during interruption. | **Resolved by approved recovery decision.** |
| C-06 | Time-box claims | The guide presents a ten-day build outline and schedule. | Treat timing as illustrative planning material, not a delivery or readiness guarantee. Stage evidence and prerequisite gates control progression. | Resolved. |
| C-07 | Existing repository assumptions | The guide notes that a repository was not supplied in its design context. The current recovery workspace now contains a partial scaffold and no commits. | Use current filesystem evidence for repository state. Do not infer implementation or historical provenance from either PDF. | Resolved for documentation; runtime verification pending. |
| C-08 | Provider capability and approval | Both documents describe Meta, WhatsApp, voice, and other integrations, but document prose is not provider/account evidence. | Keep all external integrations disabled until provider/account, permission, webhook, consent, and sandbox evidence is recorded in the appropriate stages. | Unresolved external gate. |

## 5. Requirements mapping rule

`docs/requirements-to-stages.md` now has one canonical row per promptbook stage. Capability wording from the older matrix is retained only as a mapping to the promptbook stage that owns it. The superseded matrix remains at `docs/recovery/superseded-requirements-to-stages.md` and is not executable planning data.

The mapping follows these ownership rules:

- Durable identity, tenant scope, contracts, storage, auth, authorization, and secrets belong to Stages 04–08 before provider features.
- Tenant lifecycle and lead/contact records belong to Stages 09–10.
- Consent, connectors, conversations, inbox/outbox, queues, and dashboard foundations precede channel activation.
- Channel integrations begin at Stage 27 and are not implied by connector configuration alone.
- AI, retrieval, voice, analytics, operations, deployment, acceptance, and pilot work follow the numbered promptbook sequence rather than the old capability ordering.

## 5.1 Validator diagnosis and repair

The reported validator failures came from an intermediate status-model migration, not from a legitimate architecture rule:

- `scripts/stage-model.mjs` parsed the index and ledger by positional Markdown columns and normalized missing verification values to the string `"null"`. During the migration, the index and ledger were edited at different times, so stage 02 and stages 09–72 compared different status values, while stages 03–08 retained the legacy `historical_failed` execution label.
- The earlier table data paired legacy progress labels with current results, including `failed` plus `not_started`. The correct model separates current `verification_status` from `execution_state`; historical failed reports remain evidence and do not create a current result for unstarted stages.
- `scripts/validate-stage.mjs` originally checked duplicate numbers and equality between the two files but did not require the canonical 1–72 sequence. A list with the same missing number in both files could pass.
- `scripts/validate-stage-fixtures.mjs` originally exercised only a small valid/invalid pair and did not run the real index/ledger or cover mismatched fields, missing/duplicate numbers, historical evidence, or stages 68–72.

The repair centralizes allowed values, combination rules, index/ledger comparison, optional separated `historicalEvidence`, and expected-stage-sequence checks in `scripts/stage-model.mjs`. The fixture runner now tests eight valid state cases, ten invalid consistency cases, and the real 1–72 Markdown files, including stages 68–72. It does not hardcode a passing result for the canonical files.

## 6. Documentation changes made

| File | Change |
|---|---|
| `docs/recovery/architecture-reconciliation.md` | Added this source inventory, authority decision, full stage catalog, conflict register, implementation boundary, and approved status-model resolution. |
| `docs/decisions/ADR-0002-stage-sequence.md` | Updated the decision from an initial 01–10 placeholder to the verified promptbook sequence through Stage 72. |
| `docs/stage-index.md` | Replaced the unresolved 01–10-only index with all 72 canonical stages and separate verification/execution fields. |
| `docs/stage-ledger.md` | Extended the ledger through Stage 72 and separated official verification results from execution state. |
| `docs/requirements-to-stages.md` | Added one canonical requirement/stage row for each promptbook stage with verification and execution fields. |
| `docs/architecture.md` | Recorded the PDF authority decision, clarified the current partial-scaffold evidence, and linked the full 72-stage source. |
| `docs/recovery/initial-audit.md` | Added an amendment so the historical “blueprint absent” and “documentation-only” findings are not mistaken for current filesystem state. |

Historical reports under `docs/stages/01.md` and `docs/stages/03.md` through `docs/stages/08.md` were not rewritten.

## 7. Implementation boundary and current blockers

- No application source behavior was added in this reconciliation.
- No migrations, database commands, provider calls, external account changes, production resources, or live sends/imports/calls were performed.
- A partial Stage 02 scaffold and an earlier `pnpm install` already existed before this reconciliation. Their presence is recorded, but no install, build, startup, readiness, test, or typecheck result is promoted to stage evidence.
- Git has no commits; the intended `origin` is configured and the local primary branch is `main`. No Git history was rewritten.
- Stage 02 remains `verification_status: null`, `execution_state: interrupted`, and requires a separate evidence report.
- Stages 03–08 retain their historical `failed` status until their prerequisites are explicitly rerun and accepted.
- External MySQL/vendor and provider-account evidence remains pending even though the promptbook is now available.

## 8. Approval gate

The source documents, architecture conflict register, status model, and Stage 01 acceptance report are approved. The next safe action is to publish this documentation/status-model unit, then complete only Stage 02 local-foundation evidence. Do not start Stage 03 or feature/channel work until Stage 02 has a report with exact commands, actual results, health/readiness evidence, lockfile evidence, and the required security/tenant-boundary checks.
