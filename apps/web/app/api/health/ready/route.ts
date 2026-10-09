export async function GET() {
  const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4000";
  try {
    const response = await fetch(`${apiBaseUrl}/health/live`, { cache: "no-store" });
    if (!response.ok) throw new Error(`api ${response.status}`);
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
