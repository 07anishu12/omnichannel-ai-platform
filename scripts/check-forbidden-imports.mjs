import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export const FORBIDDEN_IMPORTS = {
  web: {
    root: "apps/web",
    extensions: [".ts", ".tsx", ".mjs", ".js"],
    forbidden: [
      /^@omni\/(api|worker|db)(\/|$)/,
      /^(mysql2|mysql|ioredis|redis|bullmq|@qdrant\/)/,
      /^@prisma\//,
      /^(node:)?(fs|child_process|net|tls)$/,
    ],
  },
  python: {
    root: "services/ai-service",
    extensions: [".py"],
    forbidden: [/^(mysql|pymysql|sqlalchemy|aiomysql)(\.|$)/, /^(redis|bullmq)(\.|$)/],
  },
};

const IMPORT_PATTERNS = [
  /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
  /\bexport\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
];

const PYTHON_IMPORT_PATTERN = /^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm;

export function specifiersIn(source, extension) {
  if (extension === ".py") {
    return [...source.matchAll(PYTHON_IMPORT_PATTERN)].map((match) => match[1] ?? match[2]);
  }
  return IMPORT_PATTERNS.flatMap((pattern) => [...source.matchAll(pattern)].map((m) => m[1]));
}

export function violationsIn(source, extension, forbidden) {
  return specifiersIn(source, extension).filter((specifier) =>
    forbidden.some((pattern) => pattern.test(specifier)),
  );
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".next", ".venv", "dist", "__pycache__"].includes(entry.name)) return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

export function scanBoundary(rootDir, boundary) {
  const findings = [];
  const base = path.join(rootDir, boundary.root);
  for (const file of walk(base)) {
    const extension = path.extname(file);
    if (!boundary.extensions.includes(extension)) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const specifier of violationsIn(source, extension, boundary.forbidden)) {
      findings.push(`${path.relative(rootDir, file)} imports forbidden module "${specifier}"`);
    }
  }
  return findings;
}

export function checkForbiddenImports(rootDir = process.cwd(), boundaries = FORBIDDEN_IMPORTS) {
  return Object.values(boundaries).flatMap((boundary) => scanBoundary(rootDir, boundary));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = checkForbiddenImports();
  if (findings.length) {
    console.error(findings.map((finding) => `- ${finding}`).join("\n"));
    process.exit(1);
  }
  console.log("PASS: web and ai-service sources contain no forbidden backend or store imports.");
}
