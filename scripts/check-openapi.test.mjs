import assert from "node:assert/strict";
import test from "node:test";
import { committedOpenApiPath, openApiMatches, renderOpenApi } from "./check-openapi.mjs";
import { readFileSync } from "node:fs";

test("committed OpenAPI document matches the contracts generator", () => {
  assert.equal(openApiMatches(readFileSync(committedOpenApiPath, "utf8"), renderOpenApi()), true);
});

test("a stale OpenAPI document is reported as a mismatch", () => {
  assert.equal(openApiMatches("{}\n", renderOpenApi()), false);
});
