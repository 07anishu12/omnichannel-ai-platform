import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(repoRoot, "scripts", "validate-stage.mjs");

function run(args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: repoRoot, encoding: "utf8" });
}

test("validate-stage accepts stage 02 against the real ledger and index", () => {
  const result = run(["--stage", "02"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /PASS: canonical stages/);
});

test("validate-stage rejects an unknown stage with exit code 1", () => {
  const result = run(["--stage", "99"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown stage 99/);
});

test("validate-stage reports a missing input file without a Node stack trace", () => {
  const result = run(["--index", "does-not-exist.md"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot read does-not-exist\.md: ENOENT/);
  assert.doesNotMatch(result.stderr, /node:fs/);
});
