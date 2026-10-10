import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { errorResponse, errorResponseSchema } from "./errors.js";
import { eventEnvelopeV1Schema } from "./events.js";
import { buildOpenApiDocument } from "./openapi.js";
import { apiMetaV1ResponseSchema, internalHealthV1ResponseSchema } from "./v1.js";
import {
  checkExpectedConfigVersion,
  configVersionSchema,
  negotiateSchemaVersion,
} from "./versions.js";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));

describe("schema version negotiation", () => {
  it("defaults to the current version when no header is sent", () => {
    assert.equal(negotiateSchemaVersion(undefined), "1");
  });

  it("accepts a supported version", () => {
    assert.equal(negotiateSchemaVersion("1"), "1");
  });

  it("rejects an unsupported version", () => {
    assert.equal(negotiateSchemaVersion("2"), undefined);
    assert.equal(negotiateSchemaVersion("0"), undefined);
    assert.equal(negotiateSchemaVersion(""), undefined);
  });
});

describe("stale config version", () => {
  it("accepts a matching expected version", () => {
    assert.deepEqual(checkExpectedConfigVersion(4, 4), { ok: true });
  });

  it("reports stale_version when the expected version differs", () => {
    assert.deepEqual(checkExpectedConfigVersion(5, 4), { ok: false, code: "stale_version" });
  });

  it("rejects negative or fractional config versions", () => {
    assert.equal(configVersionSchema.safeParse(-1).success, false);
    assert.equal(configVersionSchema.safeParse(1.5).success, false);
    assert.equal(configVersionSchema.safeParse(0).success, true);
  });
});

describe("error envelope", () => {
  it("builds a stable error response", () => {
    assert.deepEqual(errorResponse("not_found", "resource not found", "corr-1"), {
      error: { code: "not_found", message: "resource not found", correlationId: "corr-1" },
    });
  });

  it("rejects unknown error codes", () => {
    const parsed = errorResponseSchema.safeParse({
      error: { code: "boom", message: "x", correlationId: "c" },
    });
    assert.equal(parsed.success, false);
  });

  it("round-trips the unsupported-version fixture", () => {
    const value = fixture("error-unsupported-version.json");
    assert.deepEqual(errorResponseSchema.parse(value), value);
  });

  it("round-trips the stale-version fixture", () => {
    const value = fixture("error-stale-version.json");
    assert.deepEqual(errorResponseSchema.parse(value), value);
  });
});

describe("v1 response schemas", () => {
  it("round-trips the api meta fixture", () => {
    const value = fixture("api-v1-meta.json");
    assert.deepEqual(apiMetaV1ResponseSchema.parse(value), value);
  });

  it("rejects an api meta response with no schema versions", () => {
    const parsed = apiMetaV1ResponseSchema.safeParse({
      service: "api",
      apiVersion: "v1",
      schemaVersions: [],
    });
    assert.equal(parsed.success, false);
  });

  it("round-trips the internal health fixture", () => {
    const value = fixture("internal-v1-health.json");
    assert.deepEqual(internalHealthV1ResponseSchema.parse(value), value);
  });
});

describe("event envelope v1", () => {
  it("round-trips the event fixture", () => {
    const value = fixture("event-envelope-v1.json");
    assert.deepEqual(eventEnvelopeV1Schema.parse(value), value);
  });

  it("rejects an unsupported schema version", () => {
    const value = { ...(fixture("event-envelope-v1.json") as Record<string, unknown>) };
    value.schemaVersion = "2";
    assert.equal(eventEnvelopeV1Schema.safeParse(value).success, false);
  });

  it("rejects a payload carrying credential-like keys at any depth", () => {
    const base = fixture("event-envelope-v1.json") as Record<string, unknown>;
    const withToken = { ...base, payload: { nested: { access_token: "synthetic" } } };
    const withPassword = { ...base, payload: { password: "synthetic" } };
    assert.equal(eventEnvelopeV1Schema.safeParse(withToken).success, false);
    assert.equal(eventEnvelopeV1Schema.safeParse(withPassword).success, false);
  });

  it("rejects unknown top-level fields", () => {
    const base = fixture("event-envelope-v1.json") as Record<string, unknown>;
    assert.equal(eventEnvelopeV1Schema.safeParse({ ...base, extra: 1 }).success, false);
  });
});

describe("openapi document", () => {
  it("covers public, versioned, and internal paths", () => {
    const doc = buildOpenApiDocument() as { paths: Record<string, unknown> };
    assert.deepEqual(Object.keys(doc.paths).sort(), [
      "/api/v1/meta",
      "/health/live",
      "/health/ready",
      "/internal/v1/health",
    ]);
  });

  it("declares every referenced component schema", () => {
    const doc = buildOpenApiDocument() as { components: { schemas: Record<string, unknown> } };
    const serialized = JSON.stringify(doc);
    for (const match of serialized.matchAll(/#\/components\/schemas\/([A-Za-z0-9]+)/g)) {
      assert.ok(match[1] !== undefined && match[1] in doc.components.schemas, match[1]);
    }
  });
});
