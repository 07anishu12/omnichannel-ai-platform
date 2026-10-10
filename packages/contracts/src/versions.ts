import { z } from "zod";

export const SCHEMA_VERSION_HEADER = "x-schema-version";
export const SUPPORTED_SCHEMA_VERSIONS = ["1"] as const;

export const schemaVersionSchema = z.enum(SUPPORTED_SCHEMA_VERSIONS);
export type SchemaVersion = z.infer<typeof schemaVersionSchema>;

export function negotiateSchemaVersion(requested: string | undefined): SchemaVersion | undefined {
  if (requested === undefined)
    return SUPPORTED_SCHEMA_VERSIONS[SUPPORTED_SCHEMA_VERSIONS.length - 1];
  const parsed = schemaVersionSchema.safeParse(requested);
  return parsed.success ? parsed.data : undefined;
}

export const configVersionSchema = z.int().nonnegative();
export type ConfigVersion = z.infer<typeof configVersionSchema>;

export type ExpectedVersionResult = { ok: true } | { ok: false; code: "stale_version" };

export function checkExpectedConfigVersion(
  current: ConfigVersion,
  expected: ConfigVersion,
): ExpectedVersionResult {
  return current === expected ? { ok: true } : { ok: false, code: "stale_version" };
}
