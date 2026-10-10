import { z } from "zod";

export const FORBIDDEN_PAYLOAD_KEY =
  /(password|passwd|secret|token|credential|api[-_]?key|authorization|cookie)/i;

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (value !== null && typeof value === "object") {
    return Object.entries(value).some(
      ([key, nested]) => FORBIDDEN_PAYLOAD_KEY.test(key) || containsForbiddenKey(nested),
    );
  }
  return false;
}

const payloadSchema = z.record(z.string(), z.unknown()).superRefine((payload, ctx) => {
  if (containsForbiddenKey(payload)) {
    ctx.addIssue({ code: "custom", message: "payload must not carry credential-like keys" });
  }
});

export const eventEnvelopeV1Schema = z
  .object({
    schemaVersion: z.literal("1"),
    eventId: z.uuid(),
    eventType: z
      .string()
      .max(100)
      .regex(/^[a-z]+(\.[a-z_]+)+$/),
    occurredAt: z.iso.datetime(),
    tenantId: z.uuid(),
    correlationId: z.string().min(1).max(128),
    producer: z.enum(["api", "worker", "ai-service"]),
    payload: payloadSchema,
  })
  .strict();

export type EventEnvelopeV1 = z.infer<typeof eventEnvelopeV1Schema>;
