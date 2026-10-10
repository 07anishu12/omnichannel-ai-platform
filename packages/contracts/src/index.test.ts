import assert from "node:assert/strict";
import test from "node:test";
import { dependencyStatusSchema, liveResponseSchema, readinessResponseSchema } from "./index.js";

test("liveResponseSchema accepts an ok response with a service name", () => {
  assert.equal(liveResponseSchema.safeParse({ status: "ok", service: "api" }).success, true);
});

test("liveResponseSchema rejects a non-ok status and an empty service name", () => {
  assert.equal(liveResponseSchema.safeParse({ status: "down", service: "api" }).success, false);
  assert.equal(liveResponseSchema.safeParse({ status: "ok", service: "" }).success, false);
});

test("dependencyStatusSchema accepts only the three documented statuses", () => {
  for (const status of ["reachable", "unreachable", "disabled"]) {
    assert.equal(dependencyStatusSchema.safeParse({ name: "redis", status }).success, true);
  }
  assert.equal(
    dependencyStatusSchema.safeParse({ name: "redis", status: "degraded" }).success,
    false,
  );
});

test("dependencyStatusSchema caps detail at 200 characters", () => {
  const detail = "x".repeat(201);
  assert.equal(
    dependencyStatusSchema.safeParse({ name: "redis", status: "unreachable", detail }).success,
    false,
  );
});

test("readinessResponseSchema requires a known readiness status and a dependency list", () => {
  const valid = {
    status: "ready",
    service: "api",
    dependencies: [{ name: "redis", status: "reachable" }],
  };
  assert.equal(readinessResponseSchema.safeParse(valid).success, true);
  assert.equal(readinessResponseSchema.safeParse({ ...valid, status: "maybe" }).success, false);
  assert.equal(
    readinessResponseSchema.safeParse({ ...valid, dependencies: "none" }).success,
    false,
  );
});
