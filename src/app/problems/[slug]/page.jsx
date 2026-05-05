import { getProblemBySlug, getProblems } from "../../../lib/problem-store";
import { connectToDatabase } from "../../../lib/db/connect";
import Contest from "../../../lib/db/models/Contest";
import DuelRoom from "../../../lib/db/models/DuelRoom";
import { getDuelStatus } from "../../../lib/duels/leaderboard";
import { notFound } from "next/navigation";
import ProblemNavigator from "../../../components/ProblemNavigator";

export default async function ProblemDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const contestSlug = String(query?.contest || "").trim();
  const roomCode = String(query?.room || "").trim();

  let includePrivate = false;
  let contestAccess = false;
  let roomAccess = false;
  let contestProblemSlugs = [];
  let roomProblemSlugs = [];

  if (roomCode && process.env.MONGODB_URI) {
    try {
      await connectToDatabase();

      const room = await DuelRoom.findOne({ roomCode })
        .select({ startedAt: 1, endedAt: 1, durationMinutes: 1, problems: 1 })
        .lean();

      if (room) {
        const status = getDuelStatus(room);
        roomProblemSlugs = (room.problems || []).map((item) => item.problemSlug);

        if (roomProblemSlugs.includes(slug) && status === "live") {
          roomAccess = true;
          includePrivate = true;
        }
      }
    } catch (error) {
      console.error("Failed to validate duel access:", error);
    }
  }

  if (!roomCode && contestSlug && process.env.MONGODB_URI) {
    try {
      await connectToDatabase();

      const contest = await Contest.findOne({ slug: contestSlug, isPublic: true })
        .select({ startTime: 1, endTime: 1, problems: 1 })
        .lean();

      if (contest) {
        const now = new Date().getTime();
        const start = new Date(contest.startTime).getTime();

        contestProblemSlugs = (contest.problems || []).map((item) => item.problemSlug);

        if (contestProblemSlugs.includes(slug) && now >= start) {
          includePrivate = true;
          contestAccess = true;
        }
      }
    } catch (error) {
      console.error("Failed to validate contest access:", error);
    }
  }

  if (roomCode && (!roomAccess || !roomProblemSlugs.includes(slug))) {
    notFound();
  }

  const problem = await getProblemBySlug(slug, { includePrivate });

  let allProblems = [];
  if (roomAccess && roomProblemSlugs.length > 0) {
    const roomProblems = await Promise.all(
      roomProblemSlugs.map((problemSlug) =>
        getProblemBySlug(problemSlug, { includePrivate: true })
      )
    );
    allProblems = roomProblems.filter(Boolean);
  } else if (contestAccess && contestProblemSlugs.length > 0) {
    const contestProblems = await Promise.all(
      contestProblemSlugs.map((problemSlug) =>
        getProblemBySlug(problemSlug, { includePrivate: true })
      )
    );
    allProblems = contestProblems.filter(Boolean);
  } else {
    allProblems = await getProblems({ sort: "rating" });
  }

  if (!problem) {
    notFound();
  }

  return (
    <ProblemNavigator
      initialSlug={slug}
      initialProblem={problem}
      problemList={allProblems}
      contestSlug={contestAccess ? contestSlug : undefined}
      roomCode={roomAccess ? roomCode : undefined}
    />
  );
}
