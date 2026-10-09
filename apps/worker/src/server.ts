import { buildWorkerApp } from "./app.js";

const app = await buildWorkerApp();
await app.listen({
  host: process.env.WORKER_HOST ?? "127.0.0.1",
  port: Number(process.env.WORKER_PORT ?? 4001),
});
let stopping = false;
async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  app.log.info({ signal }, "shutting down");
  await app.close();
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
