import { NextRequest, NextResponse } from "next/server";
import { getPackage } from "@/lib/data";
import { RegistryPackageIndex } from "@/lib/types";
import { db } from "@/db";
import { packages, tools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getR2PublicUrl } from "@/lib/r2";

interface RouteParams {
  params: Promise<{ namespace: string; name: string }>;
}

/**
 * GET /api/v1/packages/:namespace/:name
 *
 * Registry API consumed by `zeroclaw skill install namespace/name`.
 *
 * Response shape (matches RegistryPackageIndex in zeroclaw/src/skills/mod.rs):
 * {
 *   "name": "weather",
 *   "version": "1.2.0",
 *   "description": "...",
 *   "tools": [
 *     { "name": "get_weather", "wasm_url": "...", "manifest_url": "..." }
 *   ]
 * }
 */

/**
 * Normalize legacy manifest_url values: the old upload code incorrectly stored
 * `{toolName}.manifest.json` in the DB even when the actual R2 file was `manifest.json`.
 * The zeroclaw skill template always generates `manifest.json`, so this normalization is safe.
 */
function normalizeManifestKey(manifestKey: string, toolName: string): string {
  const brokenSuffix = `/${toolName}.manifest.json`;
  if (manifestKey.endsWith(brokenSuffix)) {
    return manifestKey.slice(0, manifestKey.lastIndexOf("/")) + "/manifest.json";
  }
  return manifestKey;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { namespace, name } = await params;

  // Basic input validation — reject path traversal attempts
  if (
    namespace.includes("..") || namespace.includes("/") ||
    name.includes("..") || name.includes("/")
  ) {
    return NextResponse.json({ error: "invalid package reference" }, { status: 400 });
  }

  // Try DB first
  let body: RegistryPackageIndex | null = null;

  try {
    const dbPkg = await db.query.packages.findFirst({
      where: and(
        eq(packages.namespace, namespace),
        eq(packages.slug, name)
      ),
    });

    if (dbPkg) {
      const dbTools = await db
        .select()
        .from(tools)
        .where(eq(tools.package_id, dbPkg.id));

      body = {
        name: dbPkg.slug,
        version: dbPkg.version,
        description: dbPkg.description ?? "",
        tools: dbTools.map((t) => ({
          name: t.name,
          wasm_url: getR2PublicUrl(t.wasm_url),
          manifest_url: getR2PublicUrl(normalizeManifestKey(t.manifest_url, t.name)),
        })),
      };
    }
  } catch {
    // DB unavailable — fall through to mock data
  }

  // Fallback to mock data
  if (!body) {
    const pkg = await getPackage(namespace, name);

    if (!pkg) {
      return NextResponse.json(
        { error: `package not found: ${namespace}/${name}` },
        { status: 404 }
      );
    }

    body = {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      tools: pkg.tools.map((t) => ({
        name: t.name,
        wasm_url: t.wasm_url,
        manifest_url: t.manifest_url,
      })),
    };
  }

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      "X-Registry": "zeromarket/1.0",
    },
  });
}
