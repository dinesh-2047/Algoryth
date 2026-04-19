import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db/connect";
import Contest from "../../../../../../lib/db/models/Contest";
import Submission from "../../../../../../lib/db/models/Submission";
import User from "../../../../../../lib/db/models/User";
import { requireAdminUser } from "../../../../../../lib/db/requestAuth";
import {
  buildContestLeaderboard,
  computeRatingChanges,
  getContestStatus,
} from "../../../../../../lib/contest/leaderboard";

export async function POST(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    await connectToDatabase();

    const contest = await Contest.findOne({ slug }).lean();
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const status = getContestStatus(contest);
    if (status !== "ended") {
      return NextResponse.json(
        { error: "Contest can only be finalized after it ends" },
        { status: 400 }
      );
    }

    if (contest.ratingProcessedAt && !force) {
      return NextResponse.json({
        message: "Ratings already finalized",
        ratingProcessedAt: contest.ratingProcessedAt,
        ratingChanges: contest.ratingChanges || [],
      });
    }

    const problemSlugs = (contest.problems || []).map((item) => item.problemSlug);

    const contestSubmissions = await Submission.find({
      problemSlug: { $in: problemSlugs },
      submittedAt: {
        $gte: contest.startTime,
        $lte: contest.endTime,
      },
    }).lean();

    const userIdSet = new Set(contestSubmissions.map((item) => String(item.userId)));
    const users = await User.find({ _id: { $in: [...userIdSet] } })
      .select({ name: 1, email: 1, rating: 1 })
      .lean();

    const usersById = users.reduce((acc, user) => {
      acc[String(user._id)] = user;
      return acc;
    }, {});

    const leaderboard = buildContestLeaderboard(contest, contestSubmissions, usersById);
    const ratingChanges = contest.isRated ? computeRatingChanges(leaderboard) : [];

    if (contest.isRated) {
      await Promise.all(
        ratingChanges.map(async (change) => {
          await User.findByIdAndUpdate(change.userId, {
            $set: { rating: change.newRating, updatedAt: new Date() },
            $inc: { contestsPlayed: 1 },
            $push: {
              contestRatingHistory: {
                contestSlug: contest.slug,
                contestTitle: contest.title,
                rank: change.rank,
                oldRating: change.oldRating,
                newRating: change.newRating,
                delta: change.delta,
                updatedAt: new Date(),
              },
            },
          });
        })
      );
    }

    const updated = await Contest.findOneAndUpdate(
      { slug },
      {
        $set: {
          ratingProcessedAt: new Date(),
          ratingChanges,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      message: "Contest finalized",
      contest: {
        slug: updated.slug,
        ratingProcessedAt: updated.ratingProcessedAt,
        ratingChanges: updated.ratingChanges || [],
      },
      leaderboard,
    });
  } catch (error) {
    console.error("Failed to finalize contest:", error);
    return NextResponse.json({ error: "Failed to finalize contest" }, { status: 500 });
  }
}
