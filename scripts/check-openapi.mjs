import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildOpenApiDocument } from "../packages/contracts/src/openapi.ts";

export const committedOpenApiPath = fileURLToPath(
  new URL("../docs/contracts/openapi.json", import.meta.url),
);

export function renderOpenApi() {
  return `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`;
}

export function openApiMatches(committed, generated) {
  return committed === generated;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const committed = readFileSync(committedOpenApiPath, "utf8");
  if (!openApiMatches(committed, renderOpenApi())) {
    console.error(
      "docs/contracts/openapi.json is stale. Run: pnpm --filter @omni/contracts openapi:generate",
    );
    process.exit(1);
  }
  console.log("docs/contracts/openapi.json matches the contracts generator.");
}
