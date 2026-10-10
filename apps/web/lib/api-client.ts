import { liveResponseSchema, type LiveResponse } from "@omni/contracts";

export async function fetchApiLive(baseUrl: string): Promise<LiveResponse> {
  const response = await fetch(`${baseUrl}/health/live`, { cache: "no-store" });
  if (!response.ok) throw new Error(`api ${response.status}`);
  return liveResponseSchema.parse(await response.json());
}
