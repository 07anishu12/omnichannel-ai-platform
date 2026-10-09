# Requirements-to-stages matrix

**Stage 01 status:** Coverage planned and reviewable; no feature implementation has started.
**Status vocabulary:** `planned` means no implementation; `pending_external` means provider/account/approval evidence is required; `unverified` means the claim could not be checked from this environment; `gate` means release cannot proceed until the listed control passes.

## Capability matrix

| Requested capability | Release class | Planned stage(s) | Provisional owner | Status | Required evidence/gate |
|---|---|---:|---|---|---|
| Facebook Lead Ads | MVP candidate; external-provider-dependent | 04, 06, 15, 16 | Connector/Partner Operations | `pending_external` + `unverified` | Meta app/business verification, approved permissions, test page/lead form, signed webhook fixture, replay/idempotency tests, canary enablement. |
| Instagram messaging | MVP candidate; external-provider-dependent | 04, 06, 08, 15, 16 | Connector/Conversation Operations | `pending_external` + `unverified` | Approved Instagram messaging capability, test account, webhook/permission evidence, tenant mapping, consent and human handoff tests. |
| Messenger | MVP candidate; external-provider-dependent | 04, 06, 08, 15, 16 | Connector/Conversation Operations | `pending_external` + `unverified` | Approved page/app permissions, test page, webhook verification, provider rate-limit/error fixtures, canary enablement. |
| Website forms | MVP | 03, 05, 08, 15 | Platform/API + Product | `planned` | Public form ingress validation, abuse/rate limiting, tenant ownership mapping, durable lead creation, consent/suppression handling, two-tenant tests. |
| WhatsApp messaging | MVP candidate; external-provider-dependent | 04, 07, 08, 15, 16 | Connector/Partner Operations | `pending_external` + `unverified` | WABA/number/test account, approved templates and permissions, webhook signature, messaging policy/consent, provider sandbox evidence. |
| WhatsApp Calling capability assessment | Later release; external-provider-dependent | 07, 13, 15 | Product + Partner Operations + Security | `pending_external` | Separate feasibility, account eligibility, country/number support, approval, consent/recording, pricing, test result, and explicit go/no-go. No calling code is enabled by messaging support. |
| Human inbox | MVP | 03, 08, 15 | Conversation Operations + Platform/API | `planned` | Tenant-scoped conversations/messages, human assignment, presence/live-stream scope, consent/suppression visibility, takeover from AI/workflow, audit trail. |
| AI chat/RAG | MVP candidate; model/provider-dependent | 03, 09, 15, 16 | AI/Retrieval + Security | `planned` + `pending_external` | Private FastAPI boundary, prompt/input limits, Qdrant access filters, MySQL ownership/version verification, citation tests, safety review, model/data-residency decision. |
| PSTN/managed AI voice | Later release; external-provider-dependent | 03, 10, 14, 15, 16 | Voice/Partner Operations + Security | `pending_external` | Separate provider approval, test number/region, consent and recording policy, human escalation, cost/rate controls, ambiguity reconciliation, explicit go/no-go. |
| Workflow automation | Later release | 03, 10, 15 | Platform/API + Product Operations | `planned` | Durable workflow versions, tenant-scoped triggers, idempotent steps, approvals for side effects, current-policy recheck, effect receipts and replay. |
| Analytics | Later release | 03, 11, 15 | Data/Analytics + Operations | `planned` | Metric definitions, tenant-safe aggregation, reconciled delivery outcomes, retention/privacy policy, export consistency, load tests. |
| Client onboarding | MVP | 02, 05, 06, 07, 15 | Product + Customer Success + Partner Operations | `planned` | Tenant creation, membership/role setup, configuration versioning, connector verification checklist, secret reference, test-tenant smoke run, no live effect by default. |
| Security | Cross-cutting release gate | 02, 03, 04, 08, 09, 15, 16 | Security/Privacy + Platform/SRE | `gate` | Tenant isolation tests, ASVS mapping, input validation, auditability, secret rotation, least privilege, threat model, backup/restore, incident runbooks, calling disabled. |
| Operations | Cross-cutting release gate | 03, 04, 09, 11, 15, 16 | SRE/Operations | `gate` | Metrics/traces/alerts, queue and provider reconciliation, backup/restore, dead-letter handling, runbooks, on-call ownership, staged rollout and rollback. |
| Export | Later release | 03, 12, 15 | Platform/API + Privacy/Data Operations | `planned` | Tenant/actor-scoped export job, object-storage controls, manifest/checksums, audit trail, retention/expiry, redaction and authorization tests. |
| Deployment | MVP foundation; release gate | 02, 15, 16 | Platform/SRE | `planned` | CI manifests/lockfiles, isolated environments, secret injection, migration rehearsal, canary, disabled external effects by default, rollback evidence. |

Every requested capability has at least one planned stage, a provisional owner, and a status. `pending_external`/`unverified` entries cannot be treated as verified live integrations.

## Release grouping

### MVP candidate

- Reusable tenant/configuration foundation, identity and scope resolution.
- Durable MySQL model, explicit repositories, audit, inbox/outbox, idempotency, and reconciliation.
- Website forms and client onboarding.
- Human inbox and safe human ownership.
- Private AI/RAG boundary may enter MVP only after its safety and data-residency gates pass.
- Meta and WhatsApp messaging can enter a controlled pilot only after provider verification; they are not assumed available.
- Security, operations, export, and deployment gates are required for any production release.

### Later release

- Advanced workflow automation.
- Analytics and reporting beyond operational metrics.
- General export and privacy workflows if not required for MVP onboarding.
- WhatsApp Calling and PSTN/managed AI voice implementation only after independent assessment.

### External-provider-dependent

- Facebook Lead Ads, Instagram messaging, Messenger, WhatsApp messaging, WhatsApp Calling, and PSTN/managed AI voice.
- Any provider-dependent AI model, telephony, recording, or account-management feature.

## Cross-stage acceptance rules

- No stage may add a direct browser-to-provider path.
- No stage may use a payload tenant ID as authorization.
- No stage may make Python the owner of a business write or external effect.
- No stage may use Redis as the only durable record of a job or event.
- No stage may accept a Qdrant result without tenant/access and trusted-record ownership/version verification.
- No stage may enable calling by default or equate connector configuration with integration verification.
- Any external effect requires consent, suppression, permission, human ownership, channel policy, connector verification, idempotency/effect receipt, and a current recheck immediately before the effect.
