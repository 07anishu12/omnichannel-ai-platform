import type { DependencyStatus, ReadinessResponse } from "@omni/contracts";

export type DependencyCheck = {
  name: string;
  enabled: boolean;
  check: () => Promise<void>;
};

export async function readiness(
  service: string,
  checks: DependencyCheck[],
): Promise<{ body: ReadinessResponse; statusCode: 200 | 503 }> {
  const dependencies: DependencyStatus[] = [];
  for (const dependency of checks) {
    if (!dependency.enabled) {
      dependencies.push({ name: dependency.name, status: "disabled" });
      continue;
    }
    try {
      await dependency.check();
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
