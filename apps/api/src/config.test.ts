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

test("missing-credential error does not echo unrelated secret values", () => {
  assert.throws(
    () => loadConfig({ QDRANT_API_KEY: "synthetic-qdrant-key" }),
    (error: unknown) =>
      error instanceof Error &&
      error.message.includes("MYSQL_PASSWORD") &&
      !error.message.includes("synthetic-qdrant-key"),
  );
});
