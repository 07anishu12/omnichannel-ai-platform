import { z } from "zod";

export const liveResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string().min(1),
});

export const dependencyStatusSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["reachable", "unreachable", "disabled"]),
  detail: z.string().max(200).optional(),
});

export const readinessResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  service: z.string().min(1),
  dependencies: z.array(dependencyStatusSchema),
});

export type LiveResponse = z.infer<typeof liveResponseSchema>;
export type DependencyStatus = z.infer<typeof dependencyStatusSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;

export * from "./errors.js";
export * from "./events.js";
export * from "./v1.js";
export * from "./versions.js";
