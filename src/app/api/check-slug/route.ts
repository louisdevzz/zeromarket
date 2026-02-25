import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { packages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface SessionUser {
  username: string;
  githubId: string;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim() ?? "";

  if (!slug) {
    return NextResponse.json({ exists: false }, { status: 200 });
  }

  // Input sanitization
  if (slug.includes("..") || slug.includes("/")) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const namespace = user.username;

  const existingPkg = await db.query.packages.findFirst({
    where: and(
      eq(packages.namespace, namespace),
      eq(packages.slug, slug)
    ),
  });

  return NextResponse.json({ exists: !!existingPkg }, { status: 200 });
}
