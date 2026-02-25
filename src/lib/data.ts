import { SkillPackage } from "./types";
import { db } from "@/db";
import { packages, tools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getR2PublicUrl } from "@/lib/r2";

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

export async function searchPackages(query: string): Promise<SkillPackage[]> {
  const allDbPackages = await db.query.packages.findMany({
    with: {
      tools: true,
    },
  });

  const dbSkillPackages = allDbPackages.map((pkg) =>
    mapDbPackageToSkillPackage(pkg, pkg.tools || [])
  );

  if (!query) return dbSkillPackages;

  const q = query.toLowerCase();
  return dbSkillPackages.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.namespace.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getAllPackages(): Promise<SkillPackage[]> {
  const allDbPackages = await db.query.packages.findMany({
    with: {
      tools: true,
    },
  });

  const dbSkillPackages = allDbPackages.map((pkg) =>
    mapDbPackageToSkillPackage(pkg, pkg.tools || [])
  );

  return dbSkillPackages;
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

  if (!query) return dbSkillPackages;

  const q = query.toLowerCase();
  return dbSkillPackages.filter(
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
