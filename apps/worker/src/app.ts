import Fastify, { type FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { liveResponseSchema } from "@omni/contracts";
import { logRedactionPaths, newCorrelationId } from "@omni/security";

type Check = { enabled: boolean; check: () => Promise<void> };

export async function buildWorkerApp(
  check: Check = {
    enabled: true,
    check: async () => {
      const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6380", {
        lazyConnect: true,
      });
      await redis.connect();
      await redis.ping();
      await redis.quit();
    },
  },
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { redact: { paths: logRedactionPaths, censor: "[REDACTED]" } },
    genReqId: (request) =>
      newCorrelationId(request.headers["x-correlation-id"] as string | undefined),
  });
  app.addHook("onSend", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });
  app.get("/health/live", async () =>
    liveResponseSchema.parse({ status: "ok", service: "worker" }),
  );
  app.get("/health/ready", async (_request, reply) => {
    if (!check.enabled)
      return reply.send({
        status: "ready",
        service: "worker",
        dependencies: [{ name: "redis", status: "disabled" }],
      });
    try {
      await check.check();
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
