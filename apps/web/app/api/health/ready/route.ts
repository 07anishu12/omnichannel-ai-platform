import { fetchApiLive } from "../../../../lib/api-client";

export async function GET() {
  const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4000";
  try {
    await fetchApiLive(apiBaseUrl);
    return Response.json({
      status: "ready",
      service: "web",
      dependencies: [{ name: "api", status: "reachable" }],
    });
  } catch {
    return Response.json(
      {
        status: "not_ready",
        service: "web",
        dependencies: [{ name: "api", status: "unreachable" }],
      },
      { status: 503 },
    );
  }
}
