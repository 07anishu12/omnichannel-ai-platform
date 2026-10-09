type Env = Record<string, string | undefined>;

function numberEnv(env: Env, name: string, fallback: number): number {
  const value = env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`${name} must be a valid TCP port`);
  }
  return parsed;
}

function boolEnv(env: Env, name: string, fallback: boolean): boolean {
  const value = env[name];
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

function requiredSecretEnv(env: Env, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `${name} is required when API_REQUIRE_MYSQL is true. Set it in the environment or in a local .env file (see .env.example).`,
    );
  }
  return value;
}

export function loadConfig(env: Env = process.env) {
  const mysqlEnabled = boolEnv(env, "API_REQUIRE_MYSQL", true);
  return {
    host: env.API_HOST ?? "127.0.0.1",
    port: numberEnv(env, "API_PORT", 4000),
    logLevel: env.API_LOG_LEVEL ?? "info",
    mysql: {
      enabled: mysqlEnabled,
      host: env.MYSQL_HOST ?? "127.0.0.1",
      port: numberEnv(env, "MYSQL_PORT", 3306),
      database: env.MYSQL_DATABASE ?? "omnichannel_local",
      user: env.MYSQL_USER ?? "omnichannel_app",
      password: mysqlEnabled
        ? requiredSecretEnv(env, "MYSQL_PASSWORD")
        : (env.MYSQL_PASSWORD ?? ""),
    },
    redis: {
      enabled: boolEnv(env, "API_REQUIRE_REDIS", true),
      url: env.REDIS_URL ?? "redis://127.0.0.1:6380",
    },
    qdrant: {
      enabled: boolEnv(env, "API_REQUIRE_QDRANT", true),
      url: env.QDRANT_URL ?? "http://127.0.0.1:6333",
      apiKey: env.QDRANT_API_KEY,
    },
  };
}

export type ApiConfig = ReturnType<typeof loadConfig>;
