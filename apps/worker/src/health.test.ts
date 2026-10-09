import assert from "node:assert/strict";
import test from "node:test";
import { buildWorkerApp } from "./app.js";

test("worker readiness is dependency-aware", async () => {
  const app = await buildWorkerApp({ enabled: true, check: async () => undefined });
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().dependencies[0].status, "reachable");
  await app.close();
});
