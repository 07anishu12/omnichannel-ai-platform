import assert from "node:assert/strict";
import test from "node:test";
import { buildWorkerApp } from "./app.js";
import { createRedisProbe, type ProbeClient } from "./redis-probe.js";

function fakeClient(overrides: Partial<ProbeClient> = {}): ProbeClient {
  return {
    status: "ready",
    connect: async () => undefined,
    ping: async () => "PONG",
    quit: async () => "OK",
    disconnect: () => undefined,
    ...overrides,
  };
}

function appWith(client: ProbeClient, timeoutMs = 50) {
  return buildWorkerApp({
    redis: { enabled: true, probe: createRedisProbe(client, timeoutMs) },
  });
}

test("worker readiness is dependency-aware", async () => {
  const app = await appWith(fakeClient());
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().dependencies[0].status, "reachable");
  await app.close();
});

test("readiness reports disabled Redis without probing", async () => {
  let pinged = false;
  const app = await buildWorkerApp({
    redis: {
      enabled: false,
      probe: createRedisProbe(
        fakeClient({
          ping: async () => {
            pinged = true;
          },
        }),
      ),
    },
  });
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().dependencies[0].status, "disabled");
  assert.equal(pinged, false);
  await app.close();
});

test("readiness returns 503 when Redis ping fails", async () => {
  const app = await appWith(
    fakeClient({
      ping: async () => {
        throw new Error("ECONNREFUSED 127.0.0.1:6380");
      },
    }),
  );
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().status, "not_ready");
  assert.equal(response.json().dependencies[0].status, "unreachable");
  assert.equal(response.json().dependencies[0].detail, "dependency unavailable");
  assert.ok(!response.body.includes("ECONNREFUSED"));
  await app.close();
});

test("readiness returns 503 within the timeout when Redis never answers", async () => {
  const app = await appWith(fakeClient({ ping: () => new Promise<never>(() => undefined) }), 30);
  const started = Date.now();
  const response = await app.inject({ method: "GET", url: "/health/ready" });
  const elapsed = Date.now() - started;
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().status, "not_ready");
  assert.ok(elapsed < 1000, `probe took ${elapsed}ms`);
  await app.close();
});

test("a lazy client is connected once before pinging", async () => {
  let connects = 0;
  let status = "wait";
  const client: ProbeClient = {
    get status() {
      return status;
    },
    connect: async () => {
      connects += 1;
      status = "ready";
    },
    ping: async () => "PONG",
    quit: async () => "OK",
    disconnect: () => undefined,
  };
  const probe = createRedisProbe(client, 50);
  await probe.check();
  await probe.check();
  assert.equal(connects, 1);
  await probe.close();
});

test("close quits a ready client", async () => {
  let quit = 0;
  const probe = createRedisProbe(
    fakeClient({
      quit: async () => {
        quit += 1;
        return "OK";
      },
    }),
    50,
  );
  await probe.close();
  assert.equal(quit, 1);
});

test("close disconnects when quit hangs past the timeout", async () => {
  let disconnected = 0;
  const probe = createRedisProbe(
    fakeClient({
      quit: () => new Promise<never>(() => undefined),
      disconnect: () => {
        disconnected += 1;
      },
    }),
    20,
  );
  await probe.close();
  assert.equal(disconnected, 1);
});

test("close does nothing for a client that never connected and is already ended", async () => {
  let disconnected = 0;
  const probe = createRedisProbe(
    fakeClient({
      status: "end",
      disconnect: () => {
        disconnected += 1;
      },
    }),
    50,
  );
  await probe.close();
  assert.equal(disconnected, 0);
});

test("closing the app closes the Redis probe", async () => {
  let closed = 0;
  const app = await buildWorkerApp({
    redis: {
      enabled: true,
      probe: {
        check: async () => undefined,
        close: async () => {
          closed += 1;
        },
      },
    },
  });
  await app.close();
  assert.equal(closed, 1);
});
