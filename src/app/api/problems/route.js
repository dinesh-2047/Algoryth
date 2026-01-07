import { NextResponse } from "next/server";
import { problems } from "../../../lib/problems";

export function GET() {
  const list = problems.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
  }));

  return NextResponse.json({ items: list });
}
