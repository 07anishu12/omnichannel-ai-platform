import Fastify, { type FastifyInstance } from "fastify";
import mysql from "mysql2/promise";
import { Redis } from "ioredis";
import { liveResponseSchema } from "@omni/contracts";
import { logRedactionPaths, newCorrelationId } from "@omni/security";
import { loadConfig, type ApiConfig } from "./config.js";
import { DEPENDENCY_CHECK_TIMEOUT_MS, readiness, type DependencyCheck } from "./health.js";
import { withTimeout } from "./timeout.js";

export type ApiAppOptions = {
  config?: ApiConfig;
  checks?: DependencyCheck[];
  dependencyTimeoutMs?: number;
};

export async function buildApiApp(options: ApiAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const database = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password,
    connectionLimit: 5,
    connectTimeout: 1000,
    timezone: "Z",
  });
  const redis = new Redis(config.redis.url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    commandTimeout: 1000,
  });
  const checks = options.checks ?? [
    {
      name: "mysql",
      enabled: config.mysql.enabled,
      check: async () => {
        const connection = await database.getConnection();
        try {
          await connection.query("SELECT 1");
        } finally {
          connection.release();
        }
      },
    },
    {
      name: "redis",
      enabled: config.redis.enabled,
      check: async () => {
        if (redis.status === "wait") await redis.connect();
        await redis.ping();
      },
    },
    {
      name: "qdrant",
      enabled: config.qdrant.enabled,
      check: async () => {
        const response = await fetch(`${config.qdrant.url.replace(/\/$/, "")}/readyz`, {
          headers: config.qdrant.apiKey ? { "api-key": config.qdrant.apiKey } : {},
          signal: AbortSignal.timeout(1000),
        });
        if (!response.ok) throw new Error(`qdrant ${response.status}`);
      },
    },
  ];

  const app = Fastify({
    logger: {
      level: config.logLevel,
      redact: { paths: logRedactionPaths, censor: "[REDACTED]" },
      serializers: {
        req: (request) => ({ id: request.id, method: request.method, url: request.url }),
        res: (reply) => ({ statusCode: reply.statusCode }),
      },
    },
    genReqId: (request) =>
      newCorrelationId(request.headers["x-correlation-id"] as string | undefined),
  });

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });

  app.get("/health/live", async (_request, reply) => {
    const body = liveResponseSchema.parse({ status: "ok", service: "api" });
    return reply.code(200).send(body);
  });

  app.get("/health/ready", async (_request, reply) => {
    const result = await readiness("api", checks, options.dependencyTimeoutMs);
    return reply.code(result.statusCode).send(result.body);
  });

  app.addHook("onClose", async () => {
    await database.end();
    if (redis.status === "ready") {
      await withTimeout(redis.quit(), DEPENDENCY_CHECK_TIMEOUT_MS, "redis quit").catch(() => {
        redis.disconnect();
      });
    } else if (redis.status !== "end") {
      redis.disconnect();
    }
  });

  return app;
}
