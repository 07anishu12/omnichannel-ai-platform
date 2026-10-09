function stage(
  number,
  scope,
  verificationStatus,
  executionState,
  prerequisite,
  evidence,
  historicalEvidence,
) {
  return {
    number,
    scope,
    verificationStatus,
    executionState,
    prerequisite,
    evidence,
    ...(historicalEvidence ? { historicalEvidence } : {}),
  };
}

function matching(name, rows, expectedNumbers, expect) {
  return {
    name,
    ...(expectedNumbers ? { expectedNumbers } : {}),
    ...(expect ? { expect } : {}),
    index: rows,
    ledger: rows.map((row) => ({ ...row })),
  };
}

export const fixtures = {
  valid: [
    matching("unstarted_without_result", [
      stage(9, "Tenant lifecycle", null, "not_started", "8", "provisioning"),
    ]),
    matching("in_progress_without_result", [
      stage(2, "Repository", null, "in_progress", "1", "runtime checks"),
    ]),
    matching("in_progress_with_prior_verified_result", [
      stage(2, "Repository", "verified", "in_progress", "1", "re-run", "docs/stages/02.md"),
    ]),
    matching("in_progress_with_prior_failed_result", [
      stage(3, "Quality gates", "failed", "in_progress", "2", "re-run", "docs/stages/03.md"),
    ]),
    matching("interrupted_with_prior_verified_result", [
      stage(2, "Repository", "verified", "interrupted", "1", "prior report", "docs/stages/02.md"),
    ]),
    matching("interrupted_with_prior_failed_result", [
      stage(
        3,
        "Quality gates",
        "failed",
        "interrupted",
        "2",
        "repair attempt",
        "docs/stages/03.md",
      ),
    ]),
    matching("completed_verified", [
      stage(4, "Contracts", "verified", "completed", "3", "contract tests"),
    ]),
    matching("completed_failed_acceptance", [
      stage(5, "Database", "failed", "completed", "4", "migration failed"),
    ]),
    matching("technically_verified_pending_external", [
      stage(
        6,
        "Authentication",
        "technically_verified_pending_external",
        "completed",
        "5",
        "internal checks; vendor gate",
      ),
    ]),
    matching("historical_failure_evidence_preserved", [
      stage(
        7,
        "Authorization",
        "failed",
        "completed",
        "6",
        "historical result",
        "docs/stages/07.md",
      ),
    ]),
  ],
  invalid: [
    matching(
      "invalid_status",
      [stage(1, "Architecture", "pending", "completed", "—", "invalid")],
      null,
      "has invalid verification_status pending",
    ),
    matching(
      "invalid_execution_state",
      [stage(1, "Architecture", null, "blocked", "—", "invalid")],
      null,
      "has invalid execution_state blocked",
    ),
    matching(
      "invalid_not_started_with_result",
      [stage(1, "Architecture", "verified", "not_started", "—", "invalid")],
      null,
      "not_started cannot have verification_status verified",
    ),
    matching(
      "invalid_completed_without_result",
      [stage(1, "Architecture", null, "completed", "—", "invalid")],
      null,
      "completed requires a verification_status",
    ),
    matching(
      "missing_required_field",
      [stage(1, "", null, "not_started", "—", "invalid")],
      null,
      "missing scope",
    ),
    {
      name: "mismatched_verification_status",
      expect: "verification_status mismatch for stage 1",
      index: [stage(1, "Architecture", "verified", "completed", "—", "index")],
      ledger: [stage(1, "Architecture", "failed", "completed", "—", "ledger")],
    },
    {
      name: "mismatched_execution_state",
      expect: "execution_state mismatch for stage 1",
      index: [stage(1, "Architecture", null, "in_progress", "—", "index")],
      ledger: [stage(1, "Architecture", null, "interrupted", "—", "ledger")],
    },
    matching(
      "duplicate_stage_numbers",
      [
        stage(1, "Architecture", null, "not_started", "—", "one"),
        stage(1, "Duplicate", null, "not_started", "—", "two"),
      ],
      null,
      "duplicate stage number in index",
    ),
    matching(
      "missing_stage_number",
      [
        stage(1, "Architecture", null, "not_started", "—", "one"),
        stage(3, "Contracts", null, "not_started", "2", "three"),
      ],
      [1, 2, 3],
      "index stage numbers do not match expected sequence",
    ),
    {
      name: "mismatched_historical_evidence",
      expect: "historical_evidence mismatch for stage 3",
      index: [
        stage(3, "Quality gates", "failed", "completed", "2", "historical", "docs/stages/03.md"),
      ],
      ledger: [
        stage(3, "Quality gates", "failed", "completed", "2", "historical", "docs/stages/04.md"),
      ],
    },
  ],
};
