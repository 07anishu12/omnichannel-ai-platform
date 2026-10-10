import assert from "node:assert/strict";
import test from "node:test";
import { logRedactionPaths, newCorrelationId, redacted } from "./index.js";

test("newCorrelationId keeps a well-formed candidate", () => {
  assert.equal(newCorrelationId("req-2026.10:abc_1"), "req-2026.10:abc_1");
});

test("newCorrelationId replaces malformed or oversized candidates", () => {
  for (const candidate of ["has space", "semi;colon", "x".repeat(129), ""]) {
    const generated = newCorrelationId(candidate);
    assert.notEqual(generated, candidate);
    assert.match(generated, /^[0-9a-f-]{36}$/);
  }
});

test("newCorrelationId generates a UUID when no candidate is given", () => {
  assert.match(newCorrelationId(), /^[0-9a-f-]{36}$/);
});

test("redaction covers credential-bearing headers and body fields", () => {
  for (const path of [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers.x-api-key",
    "req.body",
    "*.password",
    "*.token",
    "*.secret",
  ]) {
    assert.ok(logRedactionPaths.includes(path), `missing redaction path ${path}`);
  }
});

test("redacted placeholder is a fixed marker", () => {
  assert.equal(redacted, "[REDACTED]");
});
