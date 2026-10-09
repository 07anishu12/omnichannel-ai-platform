import fs from "node:fs";
import path from "node:path";
import { parseStageRows, validateStageRows } from "./stage-model.mjs";
import { fixtures } from "./fixtures/stage-status-fixtures.mjs";

for (const fixture of fixtures.valid) {
  const errors = validateStageRows(fixture.index, fixture.ledger, {
    expectedNumbers: fixture.expectedNumbers ?? null,
  });
  if (errors.length > 0) {
    console.error(`${fixture.name}:\n${errors.join("\n")}`);
    process.exit(1);
  }
}

for (const fixture of fixtures.invalid) {
  const errors = validateStageRows(fixture.index, fixture.ledger, {
    expectedNumbers: fixture.expectedNumbers ?? null,
  });
  if (errors.length === 0) {
    console.error(`${fixture.name}: invalid fixture unexpectedly passed`);
    process.exit(1);
  }
  if (fixture.expect && !errors.some((error) => error.includes(fixture.expect))) {
    console.error(
      `${fixture.name}: expected error containing "${fixture.expect}", got:\n${errors.join("\n")}`,
    );
    process.exit(1);
  }
}

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const realIndex = parseStageRows(read("docs/stage-index.md"));
const realLedger = parseStageRows(read("docs/stage-ledger.md"));
const realErrors = validateStageRows(realIndex, realLedger, {
  expectedNumbers: Array.from({ length: 72 }, (_, offset) => offset + 1),
});
if (realErrors.length > 0) {
  console.error(`real canonical stage data:\n${realErrors.join("\n")}`);
  process.exit(1);
}

for (const number of [68, 69, 70, 71, 72]) {
  const row = realIndex.find((candidate) => candidate.number === number);
  if (!row || row.verificationStatus !== "null" || row.executionState !== "not_started") {
    console.error(`real canonical stage ${number} has an unexpected current state`);
    process.exit(1);
  }
}

const historical = fixtures.valid.find(
  (fixture) => fixture.name === "historical_failure_evidence_preserved",
);
if (
  historical.index[0].historicalEvidence !== "docs/stages/07.md" ||
  historical.ledger[0].historicalEvidence !== "docs/stages/07.md"
) {
  console.error("historical failure evidence fixture was altered");
  process.exit(1);
}

console.log(
  `PASS: ${fixtures.valid.length} valid fixtures, ${fixtures.invalid.length} invalid fixtures, and real stages 1–72 accepted; stages 68–72 are unstarted without fabricated verification results.`,
);
