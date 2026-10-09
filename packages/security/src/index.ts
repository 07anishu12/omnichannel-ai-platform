import { randomUUID } from "node:crypto";

export const redacted = "[REDACTED]";

export function newCorrelationId(candidate?: string): string {
  if (candidate && /^[A-Za-z0-9._:-]{1,128}$/.test(candidate)) return candidate;
  return randomUUID();
}

export const logRedactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.x-api-key",
  "body",
  "req.body",
  "payload",
  "*.password",
  "*.token",
  "*.secret",
  "*.access_token",
  "*.refresh_token",
];
