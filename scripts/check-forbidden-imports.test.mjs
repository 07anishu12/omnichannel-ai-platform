import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkForbiddenImports, violationsIn } from "./check-forbidden-imports.mjs";

function fixtureRoot(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "forbidden-imports-"));
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

test("web source importing the API or a database driver is reported", () => {
  const root = fixtureRoot({
    "apps/web/app/page.tsx": `import { buildApiApp } from "@omni/api/src/app";\nimport mysql from "mysql2/promise";\n`,
  });
  const findings = checkForbiddenImports(root);
  assert.equal(findings.length, 2);
  assert.match(findings[0], /@omni\/api\/src\/app/);
  assert.match(findings[1], /mysql2\/promise/);
});

test("web source may import the typed contracts package", () => {
  const root = fixtureRoot({
    "apps/web/app/page.tsx": `import { liveResponseSchema } from "@omni/contracts";\n`,
  });
  assert.deepEqual(checkForbiddenImports(root), []);
});

test("dynamic and require forms of forbidden imports are detected", () => {
  const forbidden = [/^ioredis$/];
  assert.deepEqual(violationsIn(`const r = require("ioredis");`, ".ts", forbidden), ["ioredis"]);
  assert.deepEqual(violationsIn(`await import("ioredis");`, ".ts", forbidden), ["ioredis"]);
});

test("python service importing a MySQL driver is reported", () => {
  const root = fixtureRoot({
    "services/ai-service/app/store.py": "import pymysql\nfrom sqlalchemy import create_engine\n",
  });
  const findings = checkForbiddenImports(root);
  assert.equal(findings.length, 2);
  assert.match(findings[0], /pymysql/);
  assert.match(findings[1], /sqlalchemy/);
});

test("python service without store imports passes", () => {
  const root = fixtureRoot({
    "services/ai-service/app/main.py": "from fastapi import FastAPI\nimport json\n",
  });
  assert.deepEqual(checkForbiddenImports(root), []);
});
