# ADR-0002: Canonical numbered stage sequence

- **Status:** Accepted for recovery planning; implementation status is tracked separately in `docs/stage-ledger.md`.
- **Date:** 2026-10-09
- **Decision owners:** Platform/API engineering, Security/Privacy, Product, SRE/Operations

**Process note:** The approved recovery decision establishes three canonical verification statuses—`verified`, `technically_verified_pending_external`, and `failed`—plus a separate required `execution_state`: `not_started`, `in_progress`, `interrupted`, or `completed`.

## Context

The Stage 01 planning documents assigned stages 03–08 to feature areas that conflict with the later approved prompt sequence. Historical reports then followed the later prompts, producing a ledger/matrix mismatch and repeated documentation-only prerequisite failures.

The full approved 72-prompt blueprint is present at the project root as `No_Code_Platform_Development_Promptbook.pdf` and is reconciled in `docs/recovery/architecture-reconciliation.md`.

## Decision

The canonical initial sequence is:

| Stage | Scope | Prerequisites |
|---:|---|---|
| 01 | Architecture and requirements | None |
| 02 | Repository and local environment | Stage 01 reviewed |
| 03 | Quality gates and stage evidence | Stage 02 verified |
| 04 | Versioned API, event, and configuration contracts | Stage 03 verified |
| 05 | MySQL and migration discipline | Stage 04 verified |
| 06 | Authentication and tenant membership | Stage 05 verified |
| 07 | Authorization and controlled support access | Stage 06 verified |
| 08 | Secret storage and per-client credential references | Stage 07 verified |
| 09 | Tenant provisioning and lifecycle | Stage 08 verified |
| 10 | Contact, identity, and lead records | Stage 09 verified |

Stages 11–72 are defined by the promptbook and listed in [`../stage-index.md`](../stage-index.md). Existing older feature mappings for Meta, WhatsApp, inbox, AI/RAG, workflows, analytics, voice, export, operations, and deployment remain preserved as superseded historical planning evidence.

## Status rules

Only these verification statuses are valid for canonical stages:

- `verified`
- `technically_verified_pending_external`
- `failed`

The verification-status field may be `null` only when no verification result exists yet. `verified` requires implementation artifacts and acceptance evidence. `technically_verified_pending_external` requires internal evidence plus a clearly documented external gate. `failed` means the acceptance criteria or required checks are not met, or the stage could not be verified.

Every ledger/index row also requires an `execution_state`:

- `not_started`
- `in_progress`
- `interrupted`
- `completed`

`not_started` requires a `null` verification status. `in_progress` and `interrupted` may preserve a prior official verification result. `completed` requires one of the three official verification statuses. Historical reports retain their observed `failed` status and use execution metadata to distinguish completed historical attempts from current interrupted work.

Programmatic stage records may carry an optional `historicalEvidence` reference to an immutable prior report. This field is evidence only; it cannot authorize a current verification result or change `execution_state`.

## Consequences

- The old Stage 01 capability map is superseded for stages 03–08 and is preserved at [`../recovery/superseded-requirements-to-stages.md`](../recovery/superseded-requirements-to-stages.md).
- The current index and ledger have one row for each canonical stage 01–72.
- A stage runner rejects duplicate/unknown stage numbers, invalid verification statuses, invalid execution states, invalid status/state combinations, unmet prerequisites, and missing implementation evidence.
- Stage progress is not inferred from verification status, and interruption does not erase a prior official result.

## Recovery sequence

1. Confirm the project root and preserve current documentation.
2. Implement and verify Stage 02.
3. Implement and verify Stage 03.
4. Implement and verify Stage 04, then continue one canonical stage at a time.

## Rollback

This ADR and the canonical index are documentation/process changes. Revert them only with the superseded matrix and historical reports retained. Do not delete `.git`, reset history, or discard uncommitted files.
