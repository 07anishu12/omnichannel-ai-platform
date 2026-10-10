import type { DependencyStatus, ReadinessResponse } from "@omni/contracts";
import { withTimeout } from "./timeout.js";

export const DEPENDENCY_CHECK_TIMEOUT_MS = 1000;

export type DependencyCheck = {
  name: string;
  enabled: boolean;
  check: () => Promise<void>;
};

export async function readiness(
  service: string,
  checks: DependencyCheck[],
  timeoutMs: number = DEPENDENCY_CHECK_TIMEOUT_MS,
): Promise<{ body: ReadinessResponse; statusCode: 200 | 503 }> {
  const dependencies: DependencyStatus[] = [];
  for (const dependency of checks) {
    if (!dependency.enabled) {
      dependencies.push({ name: dependency.name, status: "disabled" });
      continue;
    }
    try {
      await withTimeout(
        (async () => dependency.check())(),
        timeoutMs,
        `${dependency.name} readiness`,
      );
      dependencies.push({ name: dependency.name, status: "reachable" });
    } catch {
      dependencies.push({
        name: dependency.name,
        status: "unreachable",
        detail: "dependency unavailable",
      });
    }
  }
  const ready = dependencies.every((dependency) => dependency.status !== "unreachable");
  return {
    body: { status: ready ? "ready" : "not_ready", service, dependencies },
    statusCode: ready ? 200 : 503,
  };
}
