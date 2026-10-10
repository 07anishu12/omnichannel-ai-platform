import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "./config.js";

test("missing MYSQL_PASSWORD is rejected when MySQL is required", () => {
  assert.throws(() => loadConfig({}), /MYSQL_PASSWORD is required/);
});

test("empty MYSQL_PASSWORD is rejected when MySQL is required", () => {
  assert.throws(() => loadConfig({ MYSQL_PASSWORD: "" }), /MYSQL_PASSWORD is required/);
});

test("explicit MYSQL_PASSWORD is used when MySQL is required", () => {
  const config = loadConfig({ MYSQL_PASSWORD: "synthetic-test-password" });
  assert.equal(config.mysql.enabled, true);
  assert.equal(config.mysql.password, "synthetic-test-password");
});

test("MYSQL_PASSWORD is not required when MySQL is disabled", () => {
  const config = loadConfig({ API_REQUIRE_MYSQL: "false" });
  assert.equal(config.mysql.enabled, false);
});

const withPassword = { MYSQL_PASSWORD: "synthetic-test-password" };

test("AI_SERVICE_URL and APP_ORIGIN default to local loopback addresses", () => {
  const config = loadConfig(withPassword);
  assert.equal(config.aiService.url, "http://127.0.0.1:8000");
  assert.equal(config.appOrigin, "http://127.0.0.1:3000");
  assert.equal(config.aiService.timeoutMs, 2000);
});

test("AI_SERVICE_URL and APP_ORIGIN are required when NODE_ENV is production", () => {
  assert.throws(
    () =>
      loadConfig({
        ...withPassword,
        NODE_ENV: "production",
        APP_ORIGIN: "https://app.example.com",
      }),
    /AI_SERVICE_URL is required when NODE_ENV is production/,
  );
  assert.throws(
    () =>
      loadConfig({
        ...withPassword,
        NODE_ENV: "production",
        AI_SERVICE_URL: "https://ai.internal.example",
      }),
    /APP_ORIGIN is required when NODE_ENV is production/,
  );
});

test("explicit AI_SERVICE_URL is normalized without a trailing slash", () => {
  const config = loadConfig({
    ...withPassword,
    AI_SERVICE_URL: "https://ai.internal.example/",
  });
  assert.equal(config.aiService.url, "https://ai.internal.example");
});

test("non-http origins and AI URLs are rejected", () => {
  assert.throws(
    () => loadConfig({ ...withPassword, APP_ORIGIN: "javascript:alert(1)" }),
    /APP_ORIGIN must be an absolute http or https URL/,
  );
  assert.throws(
    () => loadConfig({ ...withPassword, AI_SERVICE_URL: "not a url" }),
    /AI_SERVICE_URL must be an absolute http or https URL/,
  );
});

test("APP_ORIGIN keeps only the origin, dropping any path", () => {
  const config = loadConfig({ ...withPassword, APP_ORIGIN: "https://app.example.com/dashboard" });
  assert.equal(config.appOrigin, "https://app.example.com");
});

test("AI_SERVICE_TIMEOUT_MS must be a bounded positive integer", () => {
  assert.equal(
    loadConfig({ ...withPassword, AI_SERVICE_TIMEOUT_MS: "500" }).aiService.timeoutMs,
    500,
  );
  for (const value of ["0", "-1", "60001", "1.5", "abc"]) {
    assert.throws(
      () => loadConfig({ ...withPassword, AI_SERVICE_TIMEOUT_MS: value }),
      /AI_SERVICE_TIMEOUT_MS must be an integer between 1 and 60000/,
    );
  }
});

test("missing-credential error does not echo unrelated secret values", () => {
  assert.throws(
    () => loadConfig({ QDRANT_API_KEY: "synthetic-qdrant-key" }),
    (error: unknown) =>
      error instanceof Error &&
      error.message.includes("MYSQL_PASSWORD") &&
      !error.message.includes("synthetic-qdrant-key"),
  );
});
