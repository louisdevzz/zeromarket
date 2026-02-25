import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { packages, tools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { uploadToR2 } from "@/lib/r2";
import path from "path";

interface ManifestJson {
  name?: string;
  description?: string;
}

interface SessionUser {
  username: string;
  githubId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".wasm":
      return "application/wasm";
    case ".json":
      return "application/json";
    case ".md":
      return "text/markdown";
    default:
      return "application/octet-stream";
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const namespace = user.username;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const displayName = (formData.get("displayName") as string | null)?.trim() ?? "";
  const version = ((formData.get("version") as string | null)?.trim()) || "1.0.0";
  const tagsRaw = (formData.get("tags") as string | null) ?? "[]";
  const changelog = (formData.get("changelog") as string | null)?.trim() ?? "";

  let tags: string[] = [];
  try {
    tags = JSON.parse(tagsRaw);
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  // Collect files
  const fileEntries = formData.getAll("files") as File[];

  // Validation
  const errors: string[] = [];
  if (!slug) errors.push("Slug is required.");
  if (!displayName) errors.push("Display name is required.");
  if (fileEntries.length === 0) errors.push("Add at least one file.");

  const fileNames = fileEntries.map((f) => f.name);
  const hasWasm = fileNames.some((n) => n.endsWith(".wasm"));
  const hasSkillMd = fileNames.some(
    (n) => n === "SKILL.md" || n.endsWith("/SKILL.md")
  );

  if (fileEntries.length > 0 && !hasWasm)
    errors.push("At least one .wasm file is required.");
  if (fileEntries.length > 0 && !hasSkillMd)
    errors.push("SKILL.md is required.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  // Input sanitization — no path traversal
  if (
    slug.includes("..") ||
    slug.includes("/") ||
    namespace.includes("..")
  ) {
    return NextResponse.json(
      { error: "Invalid slug or namespace" },
      { status: 400 }
    );
  }

  // Upload files to R2: wasm/[namespace]/[slug]/[version]/
  const baseKey = `wasm/${namespace}/${slug}/${version}`;
  const manifestEntries: { toolName: string; manifest: ManifestJson }[] = [];

  for (const file of fileEntries) {
    const basename = path.basename(file.name);
    const key = `${baseKey}/${basename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = getContentType(basename);

    // Upload to R2
    await uploadToR2(key, buffer, contentType);

    if (basename === "manifest.json" || basename.endsWith(".manifest.json")) {
      try {
        const manifest: ManifestJson = JSON.parse(buffer.toString("utf-8"));
        const toolName =
          manifest.name ??
          basename.replace(".manifest.json", "").replace("manifest", slug);
        manifestEntries.push({ toolName, manifest });
      } catch {
        // Non-fatal — skip malformed manifests
      }
    }
  }

  // Derive tools from wasm files and manifests
  const wasmFiles = fileNames
    .map((n) => path.basename(n))
    .filter((n) => n.endsWith(".wasm"));

  const toolList = wasmFiles.map((wasmFile) => {
    const toolName = wasmFile.replace(".wasm", "");
    const matchedManifest = manifestEntries.find(
      (m) =>
        m.toolName === toolName ||
        m.manifest.name === toolName
    );
    const description = matchedManifest?.manifest?.description ?? "";
    const wasmUrl = `${baseKey}/${wasmFile}`;
    const manifestFileName = `${toolName}.manifest.json`;
    const manifestUrl = `${baseKey}/${manifestFileName}`;
    return { name: toolName, description, wasm_url: wasmUrl, manifest_url: manifestUrl };
  });

  // Read SKILL.md for readme content
  let readme = "";
  const skillMdFile = fileEntries.find(
    (f) => f.name === "SKILL.md" || f.name.endsWith("/SKILL.md")
  );
  if (skillMdFile) {
    readme = await skillMdFile.text();
  }

  // Upsert package in DB
  const existingPkg = await db.query.packages.findFirst({
    where: and(
      eq(packages.namespace, namespace),
      eq(packages.slug, slug)
    ),
  });

  let packageId: string;

  if (existingPkg) {
    packageId = existingPkg.id;
    await db
      .update(packages)
      .set({
        display_name: displayName,
        version,
        tags,
        changelog,
        readme,
        updated_at: new Date(),
      })
      .where(eq(packages.id, packageId));
  } else {
    packageId = `pkg_${namespace}_${slug}_${Date.now()}`;
    await db.insert(packages).values({
      id: packageId,
      namespace,
      slug,
      display_name: displayName,
      description: toolList[0]?.description ?? "",
      version,
      tags,
      changelog,
      readme,
      downloads: 0,
      verified: false,
      author_id: `u_${user.githubId}`,
    });
  }

  // Delete old tools for this package and insert new ones
  await db.delete(tools).where(eq(tools.package_id, packageId));

  if (toolList.length > 0) {
    await db.insert(tools).values(
      toolList.map((t, i) => ({
        id: `tool_${packageId}_${i}`,
        name: t.name,
        description: t.description,
        wasm_url: t.wasm_url,
        manifest_url: t.manifest_url,
        package_id: packageId,
      }))
    );
  }

  return NextResponse.json(
    { ok: true, url: `/packages/${namespace}/${slug}` },
    { status: 200 }
  );
}
