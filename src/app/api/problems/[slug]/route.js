import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../../lib/problems";

export function GET(
  _req,
  { params }
) {
  const problem = getProblemBySlug(params.slug);

  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    statement: problem.statement,
    constraints: problem.constraints,
    examples: problem.examples,
  });
}
