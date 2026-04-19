import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db/connect";
import Contest from "../../../lib/db/models/Contest";
import { getContestStatus } from "../../../lib/contest/leaderboard";

export async function GET() {
  try {
    await connectToDatabase();

    const contests = await Contest.find({ isPublic: true })
      .sort({ startTime: -1 })
      .lean();

    const items = contests.map((contest) => ({
      id: contest._id,
      slug: contest.slug,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      isRated: contest.isRated !== false,
      status: getContestStatus(contest),
      problemCount: Array.isArray(contest.problems) ? contest.problems.length : 0,
      ratingProcessedAt: contest.ratingProcessedAt || null,
    }));

    return NextResponse.json({ contests: items });
  } catch (error) {
    console.error("Failed to fetch contests:", error);
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
  }
}
