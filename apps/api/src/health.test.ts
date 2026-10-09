import assert from "node:assert/strict";
import test from "node:test";
import { buildApiApp } from "./app.js";

test("live endpoint proves only process liveness", async () => {
  const app = await buildApiApp({
    checks: [],
  });
  const response = await app.inject({ method: "GET", url: "/health/live" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok", service: "api" });
  await app.close();
});

test("readiness reports dependency reachability separately", async () => {
  const app = await buildApiApp({
    checks: [{ name: "synthetic", enabled: true, check: async () => undefined }],
  });
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().dependencies[0].status, "reachable");
  await app.close();
});

test("readiness fails when a required dependency is unreachable", async () => {
  const app = await buildApiApp({
    checks: [
      {
        name: "synthetic",
        enabled: true,
        check: async () => {
          throw new Error("down");
        },
      },
    ],
  });
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().status, "not_ready");
  await app.close();
});
