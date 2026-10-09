import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseStageRows, validateStageRows } from "./stage-model.mjs";

const root = process.cwd();

function argumentValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const index = parseStageRows(read(argumentValue("--index", "docs/stage-index.md")));
const ledger = parseStageRows(read(argumentValue("--ledger", "docs/stage-ledger.md")));
const expectedNumbers = Array.from({ length: 72 }, (_, offset) => offset + 1);
const errors = validateStageRows(index, ledger, { expectedNumbers });
const indexNumbers = index.map((row) => row.number);

const requested = process.argv.indexOf("--stage");
const stage = requested >= 0 ? Number(process.argv[requested + 1]) : undefined;
if (stage !== undefined) {
  const selected = index.find((row) => row.number === stage);
  if (!selected) errors.push(`unknown stage ${stage}`);
  const prerequisite = stage - 1;
  if (selected && prerequisite > 0) {
    const previous = index.find((row) => row.number === prerequisite);
    const prerequisiteIsAccepted =
      previous &&
      ["verified", "technically_verified_pending_external"].includes(previous.verificationStatus);
    if (!prerequisiteIsAccepted && stage !== 2)
      errors.push(`stage ${stage} prerequisite ${prerequisite} is not accepted`);
    if (
      stage === 2 &&
      previous?.verificationStatus !== "technically_verified_pending_external" &&
      previous?.verificationStatus !== "verified"
    )
      errors.push("stage 02 requires accepted stage 01");
  }
  if (selected?.verificationStatus === "verified") {
    const required =
      stage === 2
        ? [
            "package.json",
            "pnpm-workspace.yaml",
            "apps/web",
            "apps/api",
            "apps/worker",
            "services/ai-service",
            "deploy/local/compose.yaml",
          ]
        : [];
    for (const requiredPath of required) {
      if (!fs.existsSync(path.join(root, requiredPath)))
        errors.push(`verified stage ${stage} missing ${requiredPath}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(
  `PASS: canonical stages ${indexNumbers.join(", ")} are unique, status/execution-state valid, and ledger-aligned${stage === undefined ? "" : `; stage ${stage} prerequisites are acceptable`}.`,
);
