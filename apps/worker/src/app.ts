import Fastify, { type FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { liveResponseSchema } from "@omni/contracts";
import { logRedactionPaths, newCorrelationId } from "@omni/security";
import { createRedisProbe, REDIS_PROBE_TIMEOUT_MS, type RedisProbe } from "./redis-probe.js";

export type WorkerAppOptions = {
  redis?: { enabled: boolean; probe: RedisProbe };
};

export async function buildWorkerApp(options: WorkerAppOptions = {}): Promise<FastifyInstance> {
  const redis = options.redis ?? {
    enabled: true,
    probe: createRedisProbe(
      new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6380", {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: REDIS_PROBE_TIMEOUT_MS,
        commandTimeout: REDIS_PROBE_TIMEOUT_MS,
      }),
    ),
  };
  const app = Fastify({
    logger: { redact: { paths: logRedactionPaths, censor: "[REDACTED]" } },
    genReqId: (request) =>
      newCorrelationId(request.headers["x-correlation-id"] as string | undefined),
  });
  app.addHook("onSend", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });
  app.addHook("onClose", async () => {
    await redis.probe.close();
  });
  app.get("/health/live", async () =>
    liveResponseSchema.parse({ status: "ok", service: "worker" }),
  );
  app.get("/health/ready", async (_request, reply) => {
    if (!redis.enabled)
      return reply.send({
        status: "ready",
        service: "worker",
        dependencies: [{ name: "redis", status: "disabled" }],
      });
    try {
      await redis.probe.check();
      return reply.send({
        status: "ready",
        service: "worker",
        dependencies: [{ name: "redis", status: "reachable" }],
      });
    } catch {
      return reply.code(503).send({
        status: "not_ready",
        service: "worker",
        dependencies: [{ name: "redis", status: "unreachable", detail: "dependency unavailable" }],
      });
    }
  });
  return app;
}
