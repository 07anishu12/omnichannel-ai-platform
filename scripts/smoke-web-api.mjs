import { spawn } from "node:child_process";
import process from "node:process";

const API_PORT = 4100;
const WEB_PORT = 3100;
const API_BASE = `http://127.0.0.1:${API_PORT}`;
const WEB_BASE = `http://127.0.0.1:${WEB_PORT}`;

const children = [];

function start(name, command, args, env) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", (chunk) => {
    if (process.env.SMOKE_VERBOSE) process.stderr.write(`[${name}] ${chunk}`);
  });
  children.push(child);
  return child;
}

async function waitFor(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
    } catch {
      // server not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`timed out waiting for ${url}`);
}

function stopAll() {
  for (const child of children) child.kill("SIGTERM");
}

async function main() {
  start("api", "node", ["--import", "tsx", "apps/api/src/server.ts"], {
    API_HOST: "127.0.0.1",
    API_PORT: String(API_PORT),
    API_REQUIRE_MYSQL: "false",
    API_REQUIRE_REDIS: "false",
    API_REQUIRE_QDRANT: "false",
    API_LOG_LEVEL: "warn",
  });
  start(
    "web",
    "pnpm",
    [
      "--filter",
      "@omni/web",
      "exec",
      "next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(WEB_PORT),
    ],
    {
      API_BASE_URL: API_BASE,
    },
  );

  await waitFor(`${API_BASE}/health/live`);
  await waitFor(`${WEB_BASE}/api/health/live`);

  const apiLive = await (await fetch(`${API_BASE}/health/live`)).json();
  if (apiLive.service !== "api" || apiLive.status !== "ok") {
    throw new Error(`unexpected api live response: ${JSON.stringify(apiLive)}`);
  }

  const webReadyResponse = await waitFor(`${WEB_BASE}/api/health/ready`);
  const webReady = await webReadyResponse.json();
  if (webReady.status !== "ready" || webReady.dependencies[0]?.status !== "reachable") {
    throw new Error(`web ready did not reach the api: ${JSON.stringify(webReady)}`);
  }

  console.log(
    `PASS: web ready route reached api live endpoint (${API_BASE}/health/live) through @omni/contracts.`,
  );
}

main()
  .then(() => {
    stopAll();
    process.exit(0);
  })
  .catch((error) => {
    console.error(`FAIL: ${error.message}`);
    stopAll();
    process.exit(1);
  });
