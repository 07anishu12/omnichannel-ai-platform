import assert from "node:assert/strict";
import test from "node:test";
import { apiMetaV1ResponseSchema, checkExpectedConfigVersion } from "@omni/contracts";
import { buildApiApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig({ API_REQUIRE_MYSQL: "false" });

test("meta endpoint returns a v1 response valid against the contract", async () => {
  const app = await buildApiApp({ config, checks: [] });
  const response = await app.inject({ method: "GET", url: "/api/v1/meta" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(apiMetaV1ResponseSchema.parse(response.json()), {
    service: "api",
    apiVersion: "v1",
    schemaVersions: ["1"],
  });
  await app.close();
});

test("meta endpoint accepts a supported schema version header", async () => {
  const app = await buildApiApp({ config, checks: [] });
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/meta",
    headers: { "x-schema-version": "1" },
  });
  assert.equal(response.statusCode, 200);
  await app.close();
});

test("meta endpoint rejects an unsupported schema version with the error envelope", async () => {
  const app = await buildApiApp({ config, checks: [] });
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/meta",
    headers: { "x-schema-version": "2" },
  });
  assert.equal(response.statusCode, 400);
  const body = response.json();
  assert.equal(body.error.code, "unsupported_version");
  assert.equal(body.error.correlationId, response.headers["x-correlation-id"]);
  await app.close();
});

test("stale expected config version is reported as stale_version", () => {
  assert.deepEqual(checkExpectedConfigVersion(3, 3), { ok: true });
  assert.deepEqual(checkExpectedConfigVersion(4, 3), { ok: false, code: "stale_version" });
});
