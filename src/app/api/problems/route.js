import { NextResponse } from "next/server";
import { getProblems } from "../../../lib/problem-store";
import { requireAuthenticatedUser } from "../../../lib/db/requestAuth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const difficulty = searchParams.get("difficulty") || undefined;
  const tags = searchParams.get("tags")?.split(",") || [];
  const sort = searchParams.get("sort") || "title";
  const includePrivateRequested = searchParams.get("includePrivate") === "true";

  let includePrivate = false;
  if (includePrivateRequested) {
    const auth = await requireAuthenticatedUser(request);
    includePrivate = auth.ok && auth.user.role === "admin";
  }

  const filtered = await getProblems({
    search,
    difficulty,
    tags,
    sort,
    includePrivate,
  });

  return NextResponse.json({ items: filtered });
}
