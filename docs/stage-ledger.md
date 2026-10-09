# Stage ledger

**Last updated:** 2026-10-10
**Current stage:** 02
**Repository state at status-model repair:** Root contains the supplied 72-prompt PDFs and a partial, unverified Stage 02 scaffold. Git has no commits. Stage 01 documentation acceptance is being completed before Stage 02 implementation.

`verification_status` records the latest official verification result. `execution_state` records lifecycle progress separately and does not replace or erase a previous verification result.

The validator's optional `historicalEvidence` field is reserved for immutable prior reports such as `docs/stages/03.md`–`docs/stages/08.md`. It is separate from the current verification result and never changes the current execution state. The Markdown ledger keeps those report links in its evidence/gate text so historical reports remain directly reviewable.

## Verification status vocabulary

- `verified`: required local and external evidence is complete for the stage.
- `technically_verified_pending_external`: internal documentation/code checks pass, but provider/account/vendor evidence remains.
- `failed`: acceptance criteria or required checks are not met, or the stage could not be verified.
- `null`: no verification result exists yet; this is an absence of a status, not an additional official status.

## Execution-state vocabulary

- `not_started`: no execution attempt has begun.
- `in_progress`: the current stage attempt is active.
- `interrupted`: an attempt exists but did not reach a completed verification result.
- `completed`: the stage attempt/report reached a terminal verification result; that result may be `failed`.

Valid combinations are: `not_started` + `null`; `in_progress` + `null` or a preserved prior official result; `interrupted` + `null` or a preserved prior official result; and `completed` + one of the three official verification statuses. Invalid combinations include `not_started` with any official result and `completed` with `null`.

## Ledger

| Stage | Scope | Verification status | Execution state | Primary owner | Blocking gate / evidence |
|---:|---|---|---|---|---|
| 01 | Inspect and freeze architecture, ADR, requirements matrix, contracts, assumptions, and delivery plan | `technically_verified_pending_external` | `completed` | Platform/API + Product + Security | Internal PDF, architecture, dependency, mapping, and status-model evidence passed; vendor/provider evidence remains external. |
| 02 | Repository and local environment | `null` | `interrupted` | Platform/API + Platform/SRE | Partial scaffold exists; Stage 02 report, dependency approval, runtime checks, service startup/readiness, and local evidence remain incomplete. |
| 03 | Quality gates and stage evidence | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 02 evidence was absent. Re-run only after Stage 02 is accepted; see [`stages/03.md`](stages/03.md). |
| 04 | Versioned API, event, and configuration contracts | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 03 quality gates were absent; see [`stages/04.md`](stages/04.md). |
| 05 | MySQL and migration discipline | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 04 contracts were not accepted; see [`stages/05.md`](stages/05.md). |
| 06 | Authentication and tenant membership | `failed` | `completed` | Identity/Platform + Security | Historical preflight failed because Stage 05 persistence was not verified; see [`stages/06.md`](stages/06.md). |
| 07 | Authorization and controlled support access | `failed` | `completed` | Identity/Platform + Security | Historical preflight failed because Stage 06 authentication was not verified; see [`stages/07.md`](stages/07.md). |
| 08 | Secret storage and per-client credential references | `failed` | `completed` | Platform/Security + Connector Operations | Historical preflight failed because Stage 07 authorization was not verified; see [`stages/08.md`](stages/08.md). |
| 09 | Tenant provisioning and lifecycle | `null` | `not_started` | Platform/API + Customer Success | Stage 08 must be accepted; promptbook scope is available. |
| 10 | Contact, identity, and lead records | `null` | `not_started` | Platform/API + Product | Stage 09 must be accepted. |
| 11 | Consent and suppression | `null` | `not_started` | Platform/API + Privacy | Stage 10 must be accepted. |
| 12 | Provider registry and assignment | `null` | `not_started` | Platform/API + Partner Operations | Stage 11 must be accepted. |
| 13 | Conversation store | `null` | `not_started` | Platform/API + Conversation Operations | Stage 12 must be accepted. |
| 14 | Inbox and outbox | `null` | `not_started` | Platform/API + Reliability | Stage 13 must be accepted. |
| 15 | Redis and BullMQ execution | `null` | `not_started` | Platform/API + SRE | Stage 14 must be accepted. |
| 16 | Audit, idempotency, and export primitives | `null` | `not_started` | Platform/API + Security | Stage 15 must be accepted. |
| 17 | Dashboard foundation | `null` | `not_started` | Web + Platform/API | Stage 16 must be accepted. |
| 18 | Versioned configuration publishing | `null` | `not_started` | Platform/API + Product | Stage 17 must be accepted. |
| 19 | Onboarding and profile configuration | `null` | `not_started` | Product + Platform/API | Stage 18 must be accepted. |
| 20 | Forms and public intake | `null` | `not_started` | Platform/API + Product | Stage 19 must be accepted. |
| 21 | Routing editor | `null` | `not_started` | Platform/API + Product | Stage 20 must be accepted. |
| 22 | Workflow language | `null` | `not_started` | Platform/API + Automation | Stage 21 must be accepted. |
| 23 | Workflow execution | `null` | `not_started` | Platform/API + Automation | Stage 22 must be accepted. |
| 24 | Workflow UI | `null` | `not_started` | Web + Automation | Stage 23 must be accepted. |
| 25 | Connector registry | `null` | `not_started` | Platform/API + Partner Operations | Stage 24 must be accepted. |
| 26 | Communication policy and intent | `null` | `not_started` | Platform/API + Privacy | Stage 25 must be accepted. |
| 27 | Meta readiness | `null` | `not_started` | Partner Operations + Security | Stage 26 must be accepted. |
| 28 | Embedded Signup | `null` | `not_started` | Integrations + Platform/API | Stage 27 must be accepted. |
| 29 | Phone onboarding | `null` | `not_started` | Integrations + Partner Operations | Stage 28 must be accepted. |
| 30 | Webhook foundation | `null` | `not_started` | Integrations + Platform/API | Stage 29 must be accepted. |
| 31 | Lead Ads ingestion | `null` | `not_started` | Integrations + Growth | Stage 30 must be accepted. |
| 32 | Normalization and routing | `null` | `not_started` | Integrations + Platform/API | Stage 31 must be accepted. |
| 33 | WhatsApp outbound | `null` | `not_started` | Integrations + Conversation Operations | Stage 32 must be accepted. |
| 34 | WhatsApp inbound | `null` | `not_started` | Integrations + Conversation Operations | Stage 33 must be accepted. |
| 35 | Template, media, and health | `null` | `not_started` | Integrations + SRE | Stage 34 must be accepted. |
| 36 | Instagram messaging | `null` | `not_started` | Integrations + Conversation Operations | Stage 35 must be accepted. |
| 37 | Messenger | `null` | `not_started` | Integrations + Conversation Operations | Stage 36 must be accepted. |
| 38 | Website forms and import | `null` | `not_started` | Platform/API + Product | Stage 37 must be accepted. |
| 39 | Human inbox | `null` | `not_started` | Conversation Operations + Web | Stage 38 must be accepted. |
| 40 | Lead and provider workspaces | `null` | `not_started` | Web + Conversation Operations | Stage 39 must be accepted. |
| 41 | Private Python AI service | `null` | `not_started` | AI/Retrieval + Security | Stage 40 must be accepted. |
| 42 | Knowledge model | `null` | `not_started` | AI/Retrieval + Platform/API | Stage 41 must be accepted. |
| 43 | Qdrant indexing | `null` | `not_started` | AI/Retrieval + Platform/API | Stage 42 must be accepted. |
| 44 | Retrieval and RAG | `null` | `not_started` | AI/Retrieval + Security | Stage 43 must be accepted. |
| 45 | Memory | `null` | `not_started` | AI/Retrieval + Privacy | Stage 44 must be accepted. |
| 46 | Semantic cache | `null` | `not_started` | AI/Retrieval + Platform/API | Stage 45 must be accepted. |
| 47 | AI tools | `null` | `not_started` | AI/Retrieval + Platform/API | Stage 46 must be accepted. |
| 48 | AI chat | `null` | `not_started` | AI/Retrieval + Web | Stage 47 must be accepted. |
| 49 | Voice readiness | `null` | `not_started` | Voice + Security | Stage 48 must be accepted. |
| 50 | Exotel/PSTN | `null` | `not_started` | Voice + Integrations | Stage 49 must be accepted. |
| 51 | Managed voice | `null` | `not_started` | Voice + AI/Retrieval + Security | Stage 50 must be accepted. |
| 52 | Call outcomes | `null` | `not_started` | Voice + Platform/API | Stage 51 must be accepted. |
| 53 | Qualification | `null` | `not_started` | Product + AI/Retrieval | Stage 52 must be accepted. |
| 54 | Scheduling and campaigns | `null` | `not_started` | Product + Automation | Stage 53 must be accepted. |
| 55 | Outbound integrations | `null` | `not_started` | Integrations + Partner Operations | Stage 54 must be accepted. |
| 56 | Delivery packages | `null` | `not_started` | Platform/API + Customer Success | Stage 55 must be accepted. |
| 57 | Data retention | `null` | `not_started` | Privacy + Platform/API | Stage 56 must be accepted. |
| 58 | Hardening | `null` | `not_started` | Security + Platform/SRE | Stage 57 must be accepted. |
| 59 | Usage | `null` | `not_started` | Platform/API + Finance/Operations | Stage 58 must be accepted. |
| 60 | Analytics | `null` | `not_started` | Analytics + Platform/API | Stage 59 must be accepted. |
| 61 | Monitoring and recovery | `null` | `not_started` | SRE/Operations | Stage 60 must be accepted. |
| 62 | Deployment infrastructure | `null` | `not_started` | Platform/SRE | Stage 61 must be accepted. |
| 63 | Backups | `null` | `not_started` | SRE/Operations + Security | Stage 62 must be accepted. |
| 64 | Growth | `null` | `not_started` | Product + Platform/SRE | Stage 63 must be accepted. |
| 65 | AI evaluation | `null` | `not_started` | AI/Retrieval + Security | Stage 64 must be accepted. |
| 66 | Official channel acceptance | `null` | `not_started` | Partner Operations + Security | Stage 65 must be accepted. |
| 67 | Failure and load testing | `null` | `not_started` | Platform/SRE + Security | Stage 66 must be accepted. |
| 68 | Journeys and usability | `null` | `not_started` | Product + Web + Conversation Operations | Stage 67 must be accepted. |
| 69 | Release and security | `null` | `not_started` | Security + Platform/SRE | Stage 68 must be accepted. |
| 70 | Export and transfer | `null` | `not_started` | Platform/API + Privacy | Stage 69 must be accepted. |
| 71 | Pilot | `null` | `not_started` | Product + Operations | Stage 70 must be accepted. |
| 72 | Second client | `null` | `not_started` | Product + Customer Success + Platform | Stage 71 must be accepted. |

## Prompt sequence reconciliation

The supplied promptbook resolves the earlier blueprint blocker and defines Stages 01–72. The current index and matrix follow that sequence. The earlier feature map is preserved as superseded evidence under `docs/recovery/`; historical stage reports retain their original facts and statuses.

## Stage transition rules

1. Only the current stage may be implemented.
2. A failed prerequisite stops the current stage; the ledger records the smallest repair.
3. A provider configured in MySQL is not an enabled integration until verification and capability evidence are recorded.
4. A stage is not `verified` if external approval, account access, or provider behavior remains untested. Use `technically_verified_pending_external` where local evidence is complete.
5. Each stage report must list changed files, migrations/contracts, exact commands and actual results, tests not run, security/tenant evidence, external blockers, operator instructions, rollback/recovery, and one final status.
6. Stages 03–08 retain their historical `failed` status until their prerequisites are rerun and accepted; no historical report is rewritten.

## Stage 01 artifact links

- [`architecture.md`](architecture.md)
- [`decisions/ADR-0001-platform-stack.md`](decisions/ADR-0001-platform-stack.md)
- [`requirements-to-stages.md`](requirements-to-stages.md)
- [`stages/01.md`](stages/01.md)
