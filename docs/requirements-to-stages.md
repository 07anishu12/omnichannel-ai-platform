# Canonical requirements-to-stages matrix

**Authority:** [`decisions/ADR-0002-stage-sequence.md`](decisions/ADR-0002-stage-sequence.md)
**Current implementation horizon:** Stage 01; Stage 02 is the next executable stage
**verification_status values:** `verified`, `technically_verified_pending_external`, `failed`, or `null` when no verification result exists
**execution_state values:** `not_started`, `in_progress`, `interrupted`, `completed`

`verification_status` records the latest official verification result. `execution_state` describes progress separately. `null` is an explicit absence of a verification result, not an additional official status.

The previous capability matrix is preserved as [`recovery/superseded-requirements-to-stages.md`](recovery/superseded-requirements-to-stages.md). It is not an executable stage assignment because it predates the approved numbered prompt sequence.

| Requirement/capability | Canonical stage | `verification_status` | `execution_state` | Owner | Evidence or blocker |
|---|---:|---|---|---|---|
| Architecture and requirements | 01 | `technically_verified_pending_external` | `completed` | Platform/API + Product + Security | Internal PDF, architecture, dependency, mapping, and status-model evidence passed; external/vendor evidence remains. |
| Repository and local environment | 02 | `null` | `interrupted` | Platform/API + Platform/SRE | Partial scaffold exists; dependency, runtime, service, and readiness evidence is incomplete. |
| Quality gates and stage evidence | 03 | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 02 was absent; rerun after Stage 02. |
| Versioned API, event, and configuration contracts | 04 | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 03 was not accepted. |
| MySQL and migration discipline | 05 | `failed` | `completed` | Platform/API + Security | Historical preflight failed because Stage 04 was not accepted. |
| Authentication and tenant membership | 06 | `failed` | `completed` | Identity/Platform + Security | Historical preflight failed because Stage 05 was not accepted. |
| Authorization and controlled support access | 07 | `failed` | `completed` | Identity/Platform + Security | Historical preflight failed because Stage 06 was not accepted. |
| Secret storage and per-client credential references | 08 | `failed` | `completed` | Platform/Security + Connector Operations | Historical preflight failed because Stage 07 was not accepted. |
| Tenant provisioning and lifecycle | 09 | `null` | `not_started` | Platform/API + Customer Success | Requires accepted Stage 08. |
| Contact, identity, and lead records | 10 | `null` | `not_started` | Platform/API + Product | Requires accepted Stage 09. |
| Consent and suppression | 11 | `null` | `not_started` | Platform/API + Privacy | Requires accepted Stage 10. |
| Provider registry and assignment | 12 | `null` | `not_started` | Platform/API + Partner Operations | Requires accepted Stage 11. |
| Conversation store | 13 | `null` | `not_started` | Platform/API + Conversation Operations | Requires accepted Stage 12. |
| Inbox and outbox | 14 | `null` | `not_started` | Platform/API + Reliability | Requires accepted Stage 13. |
| Redis and BullMQ execution | 15 | `null` | `not_started` | Platform/API + SRE | Requires accepted Stage 14. |
| Audit, idempotency, and export primitives | 16 | `null` | `not_started` | Platform/API + Security | Requires accepted Stage 15. |
| Dashboard foundation | 17 | `null` | `not_started` | Web + Platform/API | Requires accepted Stage 16. |
| Versioned configuration publishing | 18 | `null` | `not_started` | Platform/API + Product | Requires accepted Stage 17. |
| Onboarding and profile configuration | 19 | `null` | `not_started` | Product + Platform/API | Requires accepted Stage 18. |
| Forms and public intake | 20 | `null` | `not_started` | Platform/API + Product | Requires accepted Stage 19. |
| Routing editor | 21 | `null` | `not_started` | Platform/API + Product | Requires accepted Stage 20. |
| Workflow language | 22 | `null` | `not_started` | Platform/API + Automation | Requires accepted Stage 21. |
| Workflow execution | 23 | `null` | `not_started` | Platform/API + Automation | Requires accepted Stage 22. |
| Workflow UI | 24 | `null` | `not_started` | Web + Automation | Requires accepted Stage 23. |
| Connector registry | 25 | `null` | `not_started` | Platform/API + Partner Operations | Requires accepted Stage 24. |
| Communication policy and intent | 26 | `null` | `not_started` | Platform/API + Privacy | Requires accepted Stage 25. |
| Meta readiness | 27 | `null` | `not_started` | Partner Operations + Security | Requires accepted Stage 26. |
| Embedded Signup | 28 | `null` | `not_started` | Integrations + Platform/API | Requires accepted Stage 27. |
| Phone onboarding | 29 | `null` | `not_started` | Integrations + Partner Operations | Requires accepted Stage 28. |
| Webhook foundation | 30 | `null` | `not_started` | Integrations + Platform/API | Requires accepted Stage 29. |
| Lead Ads ingestion | 31 | `null` | `not_started` | Integrations + Growth | Requires accepted Stage 30. |
| Normalization and routing | 32 | `null` | `not_started` | Integrations + Platform/API | Requires accepted Stage 31. |
| WhatsApp outbound | 33 | `null` | `not_started` | Integrations + Conversation Operations | Requires accepted Stage 32. |
| WhatsApp inbound | 34 | `null` | `not_started` | Integrations + Conversation Operations | Requires accepted Stage 33. |
| Template, media, and health | 35 | `null` | `not_started` | Integrations + SRE | Requires accepted Stage 34. |
| Instagram messaging | 36 | `null` | `not_started` | Integrations + Conversation Operations | Requires accepted Stage 35. |
| Messenger | 37 | `null` | `not_started` | Integrations + Conversation Operations | Requires accepted Stage 36. |
| Website forms and import | 38 | `null` | `not_started` | Platform/API + Product | Requires accepted Stage 37. |
| Human inbox | 39 | `null` | `not_started` | Conversation Operations + Web | Requires accepted Stage 38. |
| Lead and provider workspaces | 40 | `null` | `not_started` | Web + Conversation Operations | Requires accepted Stage 39. |
| Private Python AI service | 41 | `null` | `not_started` | AI/Retrieval + Security | Requires accepted Stage 40. |
| Knowledge model | 42 | `null` | `not_started` | AI/Retrieval + Platform/API | Requires accepted Stage 41. |
| Qdrant indexing | 43 | `null` | `not_started` | AI/Retrieval + Platform/API | Requires accepted Stage 42. |
| Retrieval and RAG | 44 | `null` | `not_started` | AI/Retrieval + Security | Requires accepted Stage 43. |
| Memory | 45 | `null` | `not_started` | AI/Retrieval + Privacy | Requires accepted Stage 44. |
| Semantic cache | 46 | `null` | `not_started` | AI/Retrieval + Platform/API | Requires accepted Stage 45. |
| AI tools | 47 | `null` | `not_started` | AI/Retrieval + Platform/API | Requires accepted Stage 46. |
| AI chat | 48 | `null` | `not_started` | AI/Retrieval + Web | Requires accepted Stage 47. |
| Voice readiness | 49 | `null` | `not_started` | Voice + Security | Requires accepted Stage 48. |
| Exotel/PSTN | 50 | `null` | `not_started` | Voice + Integrations | Requires accepted Stage 49. |
| Managed voice | 51 | `null` | `not_started` | Voice + AI/Retrieval + Security | Requires accepted Stage 50. |
| Call outcomes | 52 | `null` | `not_started` | Voice + Platform/API | Requires accepted Stage 51. |
| Qualification | 53 | `null` | `not_started` | Product + AI/Retrieval | Requires accepted Stage 52. |
| Scheduling and campaigns | 54 | `null` | `not_started` | Product + Automation | Requires accepted Stage 53. |
| Outbound integrations | 55 | `null` | `not_started` | Integrations + Partner Operations | Requires accepted Stage 54. |
| Delivery packages | 56 | `null` | `not_started` | Platform/API + Customer Success | Requires accepted Stage 55. |
| Data retention | 57 | `null` | `not_started` | Privacy + Platform/API | Requires accepted Stage 56. |
| Hardening | 58 | `null` | `not_started` | Security + Platform/SRE | Requires accepted Stage 57. |
| Usage | 59 | `null` | `not_started` | Platform/API + Finance/Operations | Requires accepted Stage 58. |
| Analytics | 60 | `null` | `not_started` | Analytics + Platform/API | Requires accepted Stage 59. |
| Monitoring and recovery | 61 | `null` | `not_started` | SRE/Operations | Requires accepted Stage 60. |
| Deployment infrastructure | 62 | `null` | `not_started` | Platform/SRE | Requires accepted Stage 61. |
| Backups | 63 | `null` | `not_started` | SRE/Operations + Security | Requires accepted Stage 62. |
| Growth | 64 | `null` | `not_started` | Product + Platform/SRE | Requires accepted Stage 63. |
| AI evaluation | 65 | `null` | `not_started` | AI/Retrieval + Security | Requires accepted Stage 64. |
| Official channel acceptance | 66 | `null` | `not_started` | Partner Operations + Security | Requires accepted Stage 65. |
| Failure and load testing | 67 | `null` | `not_started` | Platform/SRE + Security | Requires accepted Stage 66. |
| Journeys and usability | 68 | `null` | `not_started` | Product + Web + Conversation Operations | Requires accepted Stage 67. |
| Release and security | 69 | `null` | `not_started` | Security + Platform/SRE | Requires accepted Stage 68. |
| Export and transfer | 70 | `null` | `not_started` | Platform/API + Privacy | Requires accepted Stage 69. |
| Pilot | 71 | `null` | `not_started` | Product + Operations | Requires accepted Stage 70. |
| Second client | 72 | `null` | `not_started` | Product + Customer Success + Platform | Requires accepted Stage 71. |

## Rules

- A caller-supplied tenant ID is never authorization.
- No stage may be marked `verified` from documentation alone.
- A `not_started` stage must have `verification_status: null`; an `in_progress` or `interrupted` stage may preserve its prior official result.
- A `completed` execution state must have one of the three official verification statuses.
- Historical failed reports remain preserved and are not rewritten.
- External provider capabilities remain disabled until independently verified and explicitly enabled.
