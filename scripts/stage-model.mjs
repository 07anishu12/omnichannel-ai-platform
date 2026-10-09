export const NO_VERIFICATION_STATUS = "null";

export const allowedVerificationStatuses = new Set([
  "verified",
  "technically_verified_pending_external",
  "failed",
]);

export const allowedExecutionStates = new Set([
  "not_started",
  "in_progress",
  "interrupted",
  "completed",
]);

export function parseStageRows(markdown) {
  return markdown
    .split("\n")
    .filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => {
      const fields = line
        .split("|")
        .slice(1, -1)
        .map((field) => field.trim());
      return {
        number: Number(fields[0]),
        scope: fields[1],
        verificationStatus: fields[2]?.replaceAll("`", ""),
        executionState: fields[3]?.replaceAll("`", ""),
        prerequisite: fields[4],
        evidence: fields[5],
        historicalEvidence: fields[6],
      };
    });
}

function normalizedVerificationStatus(value) {
  return value === null || value === undefined || value === "" ? NO_VERIFICATION_STATUS : value;
}

function validateRow(row, label, errors) {
  for (const field of ["number", "scope", "verificationStatus", "executionState"]) {
    if (row[field] === undefined || row[field] === "") {
      errors.push(`${label} ${row.number ?? "unknown"} missing ${field}`);
    }
  }

  if (!Number.isInteger(row.number) || row.number < 1) {
    errors.push(`${label} has invalid stage number`);
  }

  const status = normalizedVerificationStatus(row.verificationStatus);
  if (status !== NO_VERIFICATION_STATUS && !allowedVerificationStatuses.has(status)) {
    errors.push(`${label} ${row.number} has invalid verification_status ${status}`);
  }
  if (!allowedExecutionStates.has(row.executionState)) {
    errors.push(`${label} ${row.number} has invalid execution_state ${row.executionState}`);
  }

  if (row.executionState === "not_started" && status !== NO_VERIFICATION_STATUS) {
    errors.push(`${label} ${row.number} not_started cannot have verification_status ${status}`);
  }
  if (row.executionState === "completed" && status === NO_VERIFICATION_STATUS) {
    errors.push(`${label} ${row.number} completed requires a verification_status`);
  }
}

export function validateStageRows(index, ledger, { expectedNumbers = null } = {}) {
  const errors = [];
  for (const [label, rows] of [
    ["index", index],
    ["ledger", ledger],
  ]) {
    if (rows.length === 0) errors.push(`${label} has no stage rows`);
    for (const row of rows) validateRow(row, label, errors);
  }

  const indexNumbers = index.map((row) => row.number);
  const ledgerNumbers = ledger.map((row) => row.number);
  if (new Set(indexNumbers).size !== indexNumbers.length)
    errors.push("duplicate stage number in index");
  if (new Set(ledgerNumbers).size !== ledgerNumbers.length)
    errors.push("duplicate stage number in ledger");
  if (indexNumbers.join(",") !== ledgerNumbers.join(","))
    errors.push("index/ledger stage-number mismatch");
  if (expectedNumbers) {
    const expected = expectedNumbers.join(",");
    if (indexNumbers.join(",") !== expected)
      errors.push("index stage numbers do not match expected sequence");
    if (ledgerNumbers.join(",") !== expected)
      errors.push("ledger stage numbers do not match expected sequence");
  }

  for (const row of index) {
    const ledgerRow = ledger.find((candidate) => candidate.number === row.number);
    if (!ledgerRow) continue;
    if (
      normalizedVerificationStatus(ledgerRow.verificationStatus) !==
      normalizedVerificationStatus(row.verificationStatus)
    ) {
      errors.push(`verification_status mismatch for stage ${row.number}`);
    }
    if (ledgerRow.executionState !== row.executionState) {
      errors.push(`execution_state mismatch for stage ${row.number}`);
    }
    if (ledgerRow.historicalEvidence !== row.historicalEvidence) {
      errors.push(`historical_evidence mismatch for stage ${row.number}`);
    }
  }

  return errors;
}
