import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { packages, tools } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/r2";

interface SessionUser {
  username: string;
  githubId: string;
}

interface RouteParams {
  params: Promise<{ namespace: string; name: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { namespace, name } = await params;

  // Input sanitization
  if (
    namespace.includes("..") ||
    namespace.includes("/") ||
    name.includes("..") ||
    name.includes("/")
  ) {
    return NextResponse.json(
      { error: "Invalid namespace or name" },
      { status: 400 }
    );
  }

  // Check if user is the owner
  if (namespace !== user.username) {
    return NextResponse.json(
      { error: "You can only delete your own packages" },
      { status: 403 }
    );
  }

  // Find the package
  const pkg = await db.query.packages.findFirst({
    where: and(
      eq(packages.namespace, namespace),
      eq(packages.slug, name)
    ),
    with: {
      tools: true,
    },
  });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Delete files from R2
  if (pkg.tools && pkg.tools.length > 0) {
    for (const tool of pkg.tools) {
      try {
        await deleteFromR2(tool.wasm_url);
        // Normalize legacy manifest key: old upload code stored `{toolName}.manifest.json`
        // but the actual R2 file is `manifest.json`.
        const manifestKey = tool.manifest_url.endsWith(`/${tool.name}.manifest.json`)
          ? tool.manifest_url.slice(0, tool.manifest_url.lastIndexOf("/")) + "/manifest.json"
          : tool.manifest_url;
        await deleteFromR2(manifestKey);
      } catch {
        // Continue even if R2 delete fails
      }
    }
  }

  // Delete package (cascade will delete tools)
  await db.delete(packages).where(eq(packages.id, pkg.id));

  return NextResponse.json({ ok: true }, { status: 200 });
}
