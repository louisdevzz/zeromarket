import { SkillPackage } from "./types";
import { db } from "@/db";
import { packages, tools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getR2PublicUrl } from "@/lib/r2";

const BASE = "https://registry.zeromarket.dev/wasm";

export const PACKAGES: SkillPackage[] = [
  {
    namespace: "zeroclaw",
    name: "weather",
    version: "1.2.0",
    description: "Real-time weather for any city via Open-Meteo. No API key required.",
    long_description: "Fetch current conditions, hourly forecasts, and 7-day outlooks for any city worldwide. Powered by the Open-Meteo API — no key needed, no rate-limit surprises.",
    tags: ["weather", "api", "utility", "free"],
    author: "zeroclaw",
    homepage: "https://github.com/zeroclaw-labs/skill-weather",
    repository: "https://github.com/zeroclaw-labs/skill-weather",
    downloads: 18_420,
    published_at: "2026-01-15",
    verified: true,
    tools: [
      {
        name: "get_weather",
        description: "Get current weather for a city",
        wasm_url: `${BASE}/zeroclaw/weather/1.2.0/get_weather.wasm`,
        manifest_url: `${BASE}/zeroclaw/weather/1.2.0/get_weather.manifest.json`,
      },
      {
        name: "get_forecast",
        description: "Get 7-day weather forecast for a city",
        wasm_url: `${BASE}/zeroclaw/weather/1.2.0/get_forecast.wasm`,
        manifest_url: `${BASE}/zeroclaw/weather/1.2.0/get_forecast.manifest.json`,
      },
    ],
    readme: `# weather

Fetch real-time weather data for any city without an API key.

## Tools

### \`get_weather\`
\`\`\`json
{ "city": "Hanoi" }
\`\`\`

### \`get_forecast\`
\`\`\`json
{ "city": "Tokyo", "days": 7 }
\`\`\`

## Build from source
\`\`\`bash
cargo build --target wasm32-wasip1 --release
\`\`\``,
  },
  {
    namespace: "zeroclaw",
    name: "github-pr-summary",
    version: "0.8.1",
    description: "Summarize GitHub pull requests — diff, reviews, CI status — in one shot.",
    long_description: "Give the agent a PR URL and get back a structured summary: what changed, who reviewed it, CI status, and whether it's safe to merge.",
    tags: ["github", "git", "devtools", "productivity"],
    author: "zeroclaw",
    repository: "https://github.com/zeroclaw-labs/skill-github",
    downloads: 9_870,
    published_at: "2026-01-28",
    verified: true,
    tools: [
      {
        name: "github_pr_summary",
        description: "Fetch and summarize a GitHub pull request",
        wasm_url: `${BASE}/zeroclaw/github-pr-summary/0.8.1/github_pr_summary.wasm`,
        manifest_url: `${BASE}/zeroclaw/github-pr-summary/0.8.1/github_pr_summary.manifest.json`,
      },
      {
        name: "github_pr_diff",
        description: "Fetch the raw diff of a GitHub pull request",
        wasm_url: `${BASE}/zeroclaw/github-pr-summary/0.8.1/github_pr_diff.wasm`,
        manifest_url: `${BASE}/zeroclaw/github-pr-summary/0.8.1/github_pr_diff.manifest.json`,
      },
    ],
    readme: `# github-pr-summary

Summarize any GitHub PR in one call.

## Tools

### \`github_pr_summary\`
\`\`\`json
{ "pr_url": "https://github.com/org/repo/pull/123", "github_token": "ghp_..." }
\`\`\`

### \`github_pr_diff\`
\`\`\`json
{ "pr_url": "https://github.com/org/repo/pull/123" }
\`\`\``,
  },
  {
    namespace: "zeroclaw",
    name: "jira-connector",
    version: "1.0.3",
    description: "Read, create, and update Jira issues directly from your agent.",
    tags: ["jira", "project-management", "productivity", "atlassian"],
    author: "zeroclaw",
    downloads: 7_210,
    published_at: "2026-02-01",
    verified: true,
    tools: [
      {
        name: "jira_get_issue",
        description: "Fetch a Jira issue by key",
        wasm_url: `${BASE}/zeroclaw/jira-connector/1.0.3/jira_get_issue.wasm`,
        manifest_url: `${BASE}/zeroclaw/jira-connector/1.0.3/jira_get_issue.manifest.json`,
      },
      {
        name: "jira_create_issue",
        description: "Create a new Jira issue",
        wasm_url: `${BASE}/zeroclaw/jira-connector/1.0.3/jira_create_issue.wasm`,
        manifest_url: `${BASE}/zeroclaw/jira-connector/1.0.3/jira_create_issue.manifest.json`,
      },
    ],
    readme: "# jira-connector\n\nConnect your ZeroClaw agent to Jira Cloud or Server.",
  },
  {
    namespace: "community",
    name: "json-validator",
    version: "0.5.0",
    description: "Validate any JSON payload against a JSON Schema definition.",
    tags: ["json", "schema", "validation", "utility"],
    author: "zeroclaw_user",
    downloads: 4_320,
    published_at: "2026-01-20",
    tools: [
      {
        name: "validate_json",
        description: "Validate a JSON string against a JSON Schema",
        wasm_url: `${BASE}/community/json-validator/0.5.0/validate_json.wasm`,
        manifest_url: `${BASE}/community/json-validator/0.5.0/validate_json.manifest.json`,
      },
    ],
    readme: "# json-validator\n\nValidate JSON payloads against a schema.",
  },
  {
    namespace: "community",
    name: "markdown-formatter",
    version: "1.1.0",
    description: "Format, lint, and prettify Markdown documents with configurable rules.",
    tags: ["markdown", "formatting", "docs", "utility"],
    author: "zeroclaw_maintainer",
    downloads: 3_190,
    published_at: "2026-01-18",
    tools: [
      {
        name: "format_markdown",
        description: "Format a Markdown string according to style rules",
        wasm_url: `${BASE}/community/markdown-formatter/1.1.0/format_markdown.wasm`,
        manifest_url: `${BASE}/community/markdown-formatter/1.1.0/format_markdown.manifest.json`,
      },
    ],
    readme: "# markdown-formatter\n\nLint and prettify Markdown documents.",
  },
  {
    namespace: "community",
    name: "currency-converter",
    version: "0.3.2",
    description: "Convert between 170+ currencies using live exchange rates.",
    tags: ["finance", "currency", "api", "utility"],
    author: "zeroclaw_node",
    downloads: 2_880,
    published_at: "2026-02-05",
    tools: [
      {
        name: "convert_currency",
        description: "Convert an amount from one currency to another",
        wasm_url: `${BASE}/community/currency-converter/0.3.2/convert_currency.wasm`,
        manifest_url: `${BASE}/community/currency-converter/0.3.2/convert_currency.manifest.json`,
      },
    ],
    readme: "# currency-converter\n\nConvert between currencies using live rates.",
  },
  {
    namespace: "community",
    name: "html-to-markdown",
    version: "2.0.0",
    description: "Convert HTML content to clean, readable Markdown.",
    tags: ["html", "markdown", "conversion", "utility"],
    author: "zeroclaw_service",
    downloads: 5_640,
    published_at: "2026-01-10",
    tools: [
      {
        name: "html_to_markdown",
        description: "Convert an HTML string to Markdown",
        wasm_url: `${BASE}/community/html-to-markdown/2.0.0/html_to_markdown.wasm`,
        manifest_url: `${BASE}/community/html-to-markdown/2.0.0/html_to_markdown.manifest.json`,
      },
    ],
    readme: "# html-to-markdown\n\nConvert HTML to clean Markdown.",
  },
  {
    namespace: "community",
    name: "cron-parser",
    version: "0.2.1",
    description: "Parse and describe cron expressions in plain English.",
    tags: ["cron", "scheduling", "utility", "devtools"],
    author: "zeroclaw_user",
    downloads: 1_950,
    published_at: "2026-02-10",
    tools: [
      {
        name: "parse_cron",
        description: "Parse a cron expression and return a human-readable description",
        wasm_url: `${BASE}/community/cron-parser/0.2.1/parse_cron.wasm`,
        manifest_url: `${BASE}/community/cron-parser/0.2.1/parse_cron.manifest.json`,
      },
    ],
    readme: "# cron-parser\n\nHuman-readable cron expression parser.",
  },
];

function mapDbPackageToSkillPackage(
  pkg: typeof packages.$inferSelect,
  dbTools: (typeof tools.$inferSelect)[]
): SkillPackage {
  return {
    namespace: pkg.namespace,
    name: pkg.slug,
    version: pkg.version,
    description: pkg.description || "",
    long_description: pkg.description || "",
    tags: pkg.tags || [],
    author: pkg.namespace,
    downloads: pkg.downloads || 0,
    published_at: pkg.created_at
      ? new Date(pkg.created_at).toISOString().split("T")[0]
      : "",
    verified: pkg.verified || false,
    readme: pkg.readme || "",
    tools: dbTools.map((t) => ({
      name: t.name,
      description: t.description || "",
      wasm_url: getR2PublicUrl(t.wasm_url),
      manifest_url: getR2PublicUrl(t.manifest_url),
    })),
  };
}

export async function getPackage(
  namespace: string,
  name: string
): Promise<SkillPackage | undefined> {
  // First check hardcoded packages
  const hardcoded = PACKAGES.find(
    (p) => p.namespace === namespace && p.name === name
  );
  if (hardcoded) return hardcoded;

  // Then check database
  const pkg = await db.query.packages.findFirst({
    where: and(
      eq(packages.namespace, namespace),
      eq(packages.slug, name)
    ),
  });

  if (!pkg) return undefined;

  const dbTools = await db.query.tools.findMany({
    where: eq(tools.package_id, pkg.id),
  });

  return mapDbPackageToSkillPackage(pkg, dbTools);
}

export function searchPackages(query: string): SkillPackage[] {
  const q = query.toLowerCase();
  if (!q) return PACKAGES;
  return PACKAGES.filter(
    (p) =>
      p.name.includes(q) ||
      p.namespace.includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

export async function searchPackagesFromDB(query: string): Promise<SkillPackage[]> {
  const allDbPackages = await db.query.packages.findMany({
    with: {
      tools: true,
    },
  });

  const dbSkillPackages = allDbPackages.map((pkg) =>
    mapDbPackageToSkillPackage(pkg, pkg.tools || [])
  );

  const allPackages = [...PACKAGES, ...dbSkillPackages];

  if (!query) return allPackages;

  const q = query.toLowerCase();
  return allPackages.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.namespace.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export const CATEGORIES = [
  { label: "Utility", tag: "utility", icon: "⚙️" },
  { label: "DevTools", tag: "devtools", icon: "🛠" },
  { label: "API", tag: "api", icon: "🔌" },
  { label: "Productivity", tag: "productivity", icon: "⚡" },
  { label: "Finance", tag: "finance", icon: "💰" },
  { label: "Docs", tag: "docs", icon: "📝" },
];

export function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
