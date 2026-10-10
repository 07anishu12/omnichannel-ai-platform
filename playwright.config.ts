import { defineConfig, devices } from "@playwright/test";

const API_BASE = "http://127.0.0.1:4100";
const WEB_BASE = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: WEB_BASE, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node --import tsx apps/api/src/server.ts",
      url: `${API_BASE}/health/live`,
      env: {
        API_HOST: "127.0.0.1",
        API_PORT: "4100",
        API_REQUIRE_MYSQL: "false",
        API_REQUIRE_REDIS: "false",
        API_REQUIRE_QDRANT: "false",
        API_LOG_LEVEL: "warn",
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: "pnpm --filter @omni/web exec next dev --hostname 127.0.0.1 --port 3100",
      url: `${WEB_BASE}/api/health/live`,
      env: { API_BASE_URL: API_BASE },
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
