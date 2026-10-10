import assert from "node:assert/strict";
import { createServer, type AddressInfo, type Socket } from "node:net";
import test from "node:test";
import { buildApiApp } from "./app.js";
import { loadConfig } from "./config.js";

async function stalledRedis() {
  const sockets = new Set<Socket>();
  let connections = 0;
  const server = createServer((socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => undefined);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `redis://127.0.0.1:${port}`,
    connections: () => connections,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

test(
  "readiness is bounded and not-ready when Redis never answers",
  { timeout: 15_000 },
  async () => {
    const redis = await stalledRedis();
    try {
      const config = loadConfig({
        API_REQUIRE_MYSQL: "false",
        API_REQUIRE_QDRANT: "false",
        REDIS_URL: redis.url,
      });
      const app = await buildApiApp({ config, dependencyTimeoutMs: 50 });

      const started = Date.now();
      const first = await app.inject({ method: "GET", url: "/health/ready" });
      const second = await app.inject({ method: "GET", url: "/health/ready" });
      const elapsed = Date.now() - started;

      for (const response of [first, second]) {
        assert.equal(response.statusCode, 503);
        assert.equal(response.json().status, "not_ready");
        const dependency = response
          .json()
          .dependencies.find((entry: { name: string }) => entry.name === "redis");
        assert.equal(dependency.status, "unreachable");
        assert.equal(dependency.detail, "dependency unavailable");
      }
      assert.ok(elapsed < 900, `two probes took ${elapsed}ms; ioredis commandTimeout is 1000ms`);
      assert.equal(redis.connections(), 1, "probes must reuse one Redis connection");

      const closeStarted = Date.now();
      await app.close();
      const closeElapsed = Date.now() - closeStarted;
      assert.ok(closeElapsed < 3000, `close took ${closeElapsed}ms`);
    } finally {
      await redis.close();
    }
  },
);
