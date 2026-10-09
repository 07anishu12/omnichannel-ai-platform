function numberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`${name} must be a valid TCP port`);
  }
  return parsed;
}

function boolEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

export function loadConfig() {
  return {
    host: process.env.API_HOST ?? "127.0.0.1",
    port: numberEnv("API_PORT", 4000),
    logLevel: process.env.API_LOG_LEVEL ?? "info",
    mysql: {
      enabled: boolEnv("API_REQUIRE_MYSQL", true),
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: numberEnv("MYSQL_PORT", 3306),
      database: process.env.MYSQL_DATABASE ?? "omnichannel_local",
      user: process.env.MYSQL_USER ?? "omnichannel_app",
      password: process.env.MYSQL_PASSWORD ?? "local-app-password",
    },
    redis: {
      enabled: boolEnv("API_REQUIRE_REDIS", true),
      url: process.env.REDIS_URL ?? "redis://127.0.0.1:6380",
    },
    qdrant: {
      enabled: boolEnv("API_REQUIRE_QDRANT", true),
      url: process.env.QDRANT_URL ?? "http://127.0.0.1:6333",
      apiKey: process.env.QDRANT_API_KEY,
    },
  };
}

export type ApiConfig = ReturnType<typeof loadConfig>;
