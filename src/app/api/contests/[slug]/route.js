import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/connect";
import Contest from "../../../../lib/db/models/Contest";
import Problem from "../../../../lib/db/models/Problem";
import Submission from "../../../../lib/db/models/Submission";
import User from "../../../../lib/db/models/User";
import { buildContestLeaderboard, getContestStatus } from "../../../../lib/contest/leaderboard";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;

    await connectToDatabase();

    const contest = await Contest.findOne({ slug, isPublic: true }).lean();
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const status = getContestStatus(contest);
    const problemRefs = contest.problems || [];
    const problemSlugs = problemRefs.map((item) => item.problemSlug);
    const problemCount = problemRefs.length;
    const totalPoints = problemRefs.reduce(
      (sum, item) => sum + Number(item.points || 0),
      0
    );

    let problemBySlug = {};
    if (status !== "upcoming" && problemSlugs.length > 0) {
      const problems = await Problem.find({ slug: { $in: problemSlugs } })
        .select({ slug: 1, title: 1, difficulty: 1, rating: 1 })
        .lean();
      problemBySlug = problems.reduce((acc, item) => {
        acc[item.slug] = item;
        return acc;
      }, {});
    }

    const contestSubmissions = await Submission.find({
      problemSlug: { $in: problemSlugs },
      submittedAt: {
        $gte: contest.startTime,
        $lte: contest.endTime,
      },
    }).lean();

    const userIds = [...new Set(contestSubmissions.map((item) => String(item.userId)))];
    const users = await User.find({ _id: { $in: userIds } })
      .select({ name: 1, email: 1, rating: 1 })
      .lean();

    const usersById = users.reduce((acc, user) => {
      acc[String(user._id)] = user;
      return acc;
    }, {});

    const leaderboard = buildContestLeaderboard(contest, contestSubmissions, usersById);

    return NextResponse.json({
      contest: {
        id: contest._id,
        slug: contest.slug,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        durationMinutes: contest.durationMinutes,
        isRated: contest.isRated !== false,
        status,
        problemCount,
        totalPoints,
        problemsLocked: status === "upcoming",
        problems:
          status === "upcoming"
            ? []
            : problemRefs.map((item) => ({
                problemSlug: item.problemSlug,
                points: Number(item.points || 1),
                title: problemBySlug[item.problemSlug]?.title || item.problemSlug,
                difficulty: problemBySlug[item.problemSlug]?.difficulty || null,
                rating: problemBySlug[item.problemSlug]?.rating || null,
              })),
        ratingProcessedAt: contest.ratingProcessedAt || null,
        ratingChanges: contest.ratingChanges || [],
      },
      leaderboard,
    });
  } catch (error) {
    console.error("Failed to fetch contest detail:", error);
    return NextResponse.json({ error: "Failed to fetch contest detail" }, { status: 500 });
  }
}
