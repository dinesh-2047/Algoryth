import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../../lib/problem-store";
import { requireAuthenticatedUser } from "../../../../lib/db/requestAuth";
import { connectToDatabase } from "../../../../lib/db/connect";
import Contest from "../../../../lib/db/models/Contest";
import DuelRoom from "../../../../lib/db/models/DuelRoom";
import { getDuelStatus } from "../../../../lib/duels/leaderboard";

export async function GET(
  req,
  { params }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const includePrivateRequested = url.searchParams.get("includePrivate") === "true";
  const contestSlug = String(url.searchParams.get("contest") || "").trim();
  const roomCode = String(url.searchParams.get("room") || "").trim();
  let includePrivate = false;
  let roomAccess = false;

  if (includePrivateRequested) {
    const auth = await requireAuthenticatedUser(req);
    includePrivate = auth.ok && auth.user.role === "admin";
  }

  if (!includePrivate && roomCode && process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const room = await DuelRoom.findOne({ roomCode })
        .select({ startedAt: 1, endedAt: 1, durationMinutes: 1, problems: 1 })
        .lean();

      if (room) {
        const status = getDuelStatus(room);
        const includesProblem = (room.problems || []).some(
          (item) => item.problemSlug === slug
        );

        if (includesProblem && status === "live") {
          includePrivate = true;
          roomAccess = true;
        }
      }
    } catch (error) {
      console.error("Duel access validation failed:", error);
    }
  }

  if (roomCode && !roomAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!roomCode && !includePrivate && contestSlug && process.env.MONGODB_URI) {
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
