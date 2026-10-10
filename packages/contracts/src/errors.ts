import { z } from "zod";

export const ERROR_CODES = [
  "invalid_request",
  "unauthorized",
  "not_found",
  "unsupported_version",
  "stale_version",
  "internal_error",
] as const;

export const errorCodeSchema = z.enum(ERROR_CODES);

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1).max(200),
    correlationId: z.string().min(1).max(128),
  }),
});

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function errorResponse(
  code: ErrorCode,
  message: string,
  correlationId: string,
): ErrorResponse {
  return errorResponseSchema.parse({ error: { code, message, correlationId } });
}
