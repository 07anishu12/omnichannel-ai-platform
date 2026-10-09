import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const serverPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "server.ts");

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (typeof address !== "object" || address === null) {
        probe.close();
        reject(new Error("no port"));
        return;
      }
      const port = address.port;
      probe.close(() => resolve(port));
    });
  });
}

test("SIGTERM stops the worker process gracefully with exit code 0", async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ["--import", "tsx", serverPath], {
    env: { ...process.env, WORKER_HOST: "127.0.0.1", WORKER_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });

  const exit = new Promise<number | null>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`worker did not exit; output: ${output}`));
    }, 15000);
    child.once("exit", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });

  const ready = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/health/live`).catch(() => undefined);
    return response?.ok === true;
  }, 15000);
  assert.equal(ready, true, `worker never became live; output: ${output}`);

  child.kill("SIGTERM");
  assert.equal(await exit, 0, `unexpected exit; output: ${output}`);
  assert.match(output, /shutting down/);
});

async function waitFor(check: () => Promise<boolean>, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}
