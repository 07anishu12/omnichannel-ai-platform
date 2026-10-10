import { expect, test } from "@playwright/test";

const FORBIDDEN_PORTS = new Set(["3306", "4100", "6333", "6380", "8000"]);

test("home page renders in a browser", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Omnichannel platform" })).toBeVisible();
});

test("browser never requests data stores, AI service, or the API port directly", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    requested.push(request.url());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const forbidden = requested.filter((url) => {
    const port = new URL(url).port;
    return FORBIDDEN_PORTS.has(port);
  });
  expect(forbidden).toEqual([]);
});

test("web ready route reports the API reachable through the typed client", async ({ page }) => {
  const response = await page.goto("/api/health/ready");
  expect(response?.status()).toBe(200);
  const body = await response?.json();
  expect(body).toEqual({
    status: "ready",
    service: "web",
    dependencies: [{ name: "api", status: "reachable" }],
  });
});
