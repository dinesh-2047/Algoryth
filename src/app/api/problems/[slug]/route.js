import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../../lib/problem-store";
import { requireAuthenticatedUser } from "../../../../lib/db/requestAuth";
import { connectToDatabase } from "../../../../lib/db/connect";
import Contest from "../../../../lib/db/models/Contest";

export async function GET(
  req,
  { params }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const includePrivateRequested = url.searchParams.get("includePrivate") === "true";
  const contestSlug = String(url.searchParams.get("contest") || "").trim();
  let includePrivate = false;

  if (includePrivateRequested) {
    const auth = await requireAuthenticatedUser(req);
    includePrivate = auth.ok && auth.user.role === "admin";
  }

  if (!includePrivate && contestSlug && process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const contest = await Contest.findOne({ slug: contestSlug, isPublic: true })
        .select({ startTime: 1, problems: 1 })
        .lean();

      if (contest) {
        const now = Date.now();
        const start = new Date(contest.startTime).getTime();
        const includesProblem = (contest.problems || []).some(
          (item) => item.problemSlug === slug
        );

        if (includesProblem && now >= start) {
          includePrivate = true;
        }
      }
    } catch (error) {
      console.error("Contest access validation failed:", error);
    }
  }

  const problem = await getProblemBySlug(slug, { includePrivate });

  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    rating: problem.rating,
    tags: problem.tags,
    statement: problem.statement,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    examples: problem.examples,
    hints: problem.hints,
    difficulty: problem.difficulty,
    starterCode: problem.starterCode,
    isPublic: problem.isPublic,
    editorial: problem.editorial,
    acceptanceRate: problem.acceptanceRate,
    submissions: problem.submissions,
  });
}
