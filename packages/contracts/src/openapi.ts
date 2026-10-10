import { z } from "zod";
import { errorResponseSchema } from "./errors.js";
import { eventEnvelopeV1Schema } from "./events.js";
import { liveResponseSchema, readinessResponseSchema } from "./index.js";
import { apiMetaV1ResponseSchema, internalHealthV1ResponseSchema } from "./v1.js";

const components: Record<string, z.ZodType> = {
  LiveResponse: liveResponseSchema,
  ReadinessResponse: readinessResponseSchema,
  ApiMetaV1Response: apiMetaV1ResponseSchema,
  InternalHealthV1Response: internalHealthV1ResponseSchema,
  ErrorResponse: errorResponseSchema,
  EventEnvelopeV1: eventEnvelopeV1Schema,
};

function toComponent(schema: z.ZodType): Record<string, unknown> {
  const json: Record<string, unknown> = {
    ...z.toJSONSchema(schema, { io: "output", unrepresentable: "any", reused: "inline" }),
  };
  delete json.$schema;
  return json;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: unknown) => ({ "application/json": { schema } });

export function buildOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: { title: "Omnichannel platform contracts", version: "1.0.0" },
    paths: {
      "/health/live": {
        get: {
          operationId: "getHealthLive",
          responses: {
            "200": { description: "Process is alive", content: json(ref("LiveResponse")) },
          },
        },
      },
      "/health/ready": {
        get: {
          operationId: "getHealthReady",
          responses: {
            "200": {
              description: "Required dependencies are reachable",
              content: json(ref("ReadinessResponse")),
            },
            "503": {
              description: "A required dependency is unreachable",
              content: json(ref("ReadinessResponse")),
            },
          },
        },
      },
      "/api/v1/meta": {
        get: {
          operationId: "getApiMetaV1",
          parameters: [
            {
              name: "x-schema-version",
              in: "header",
              required: false,
              description: "Requested schema version. Absent means the current version.",
              schema: { enum: ["1"] },
            },
          ],
          responses: {
            "200": {
              description: "API version and supported schema versions",
              content: json(ref("ApiMetaV1Response")),
            },
            "400": {
              description: "Unsupported schema version or invalid request",
              content: json(ref("ErrorResponse")),
            },
          },
        },
      },
      "/internal/v1/health": {
        get: {
          operationId: "getInternalHealthV1",
          responses: {
            "200": {
              description: "Private AI service health",
              content: json(ref("InternalHealthV1Response")),
            },
            "401": {
              description: "Missing or invalid service credential",
              content: json(ref("ErrorResponse")),
            },
          },
        },
      },
    },
    components: {
      schemas: Object.fromEntries(
        Object.entries(components).map(([name, schema]) => [name, toComponent(schema)]),
      ),
    },
  };
}
