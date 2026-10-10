import { z } from "zod";
import { schemaVersionSchema } from "./versions.js";

export const apiMetaV1ResponseSchema = z.object({
  service: z.literal("api"),
  apiVersion: z.literal("v1"),
  schemaVersions: z.array(schemaVersionSchema).min(1),
});

export const internalHealthV1ResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("ai-service"),
  audience: z.literal("omnichannel-internal"),
});

export type ApiMetaV1Response = z.infer<typeof apiMetaV1ResponseSchema>;
export type InternalHealthV1Response = z.infer<typeof internalHealthV1ResponseSchema>;
