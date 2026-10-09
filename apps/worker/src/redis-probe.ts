export const REDIS_PROBE_TIMEOUT_MS = 1000;

export type ProbeClient = {
  status: string;
  connect(): Promise<unknown>;
  ping(): Promise<unknown>;
  quit(): Promise<unknown>;
  disconnect(): void;
};

export type RedisProbe = {
  check(): Promise<void>;
  close(): Promise<void>;
};

export function withTimeout<T>(work: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

export function createRedisProbe(
  client: ProbeClient,
  timeoutMs: number = REDIS_PROBE_TIMEOUT_MS,
): RedisProbe {
  return {
    check: () =>
      withTimeout(
        (async () => {
          if (client.status === "wait") await client.connect();
          await client.ping();
        })(),
        timeoutMs,
        "redis readiness",
      ),
    close: async () => {
      if (client.status === "ready") {
        await withTimeout(client.quit(), timeoutMs, "redis quit").catch(() => client.disconnect());
      } else if (client.status !== "end") {
        client.disconnect();
      }
    },
  };
}
