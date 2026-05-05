import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/connect";
import DuelRoom from "../../../../lib/db/models/DuelRoom";
import Problem from "../../../../lib/db/models/Problem";
import Submission from "../../../../lib/db/models/Submission";
import User from "../../../../lib/db/models/User";
import { buildDuelLeaderboard, getDuelStatus } from "../../../../lib/duels/leaderboard";

export async function GET(_request, { params }) {
  try {
    const { roomCode } = await params;

    await connectToDatabase();

    const room = await DuelRoom.findOne({ roomCode: String(roomCode).trim() }).lean();
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const status = getDuelStatus(room);
    const problemsLocked = status === "waiting";
    const problemRefs = room.problems || [];
    const problemSlugs = problemRefs.map((item) => item.problemSlug);
    const problemCount = problemRefs.length;
    const totalPoints = problemRefs.reduce(
      (sum, item) => sum + Number(item.points || 0),
      0
    );

    let problemBySlug = {};
    if (!problemsLocked && problemSlugs.length > 0) {
      const problems = await Problem.find({ slug: { $in: problemSlugs } })
        .select({ slug: 1, title: 1, difficulty: 1, rating: 1 })
        .lean();
      problemBySlug = problems.reduce((acc, item) => {
        acc[item.slug] = item;
        return acc;
      }, {});
    }

    const startAt = room.startedAt ? new Date(room.startedAt) : null;
    const endAt = room.endedAt
      ? new Date(room.endedAt)
      : room.startedAt
        ? new Date(startAt.getTime() + Number(room.durationMinutes || 60) * 60000)
        : null;

    const leaderboardPayload = { rows: [], winner: null };

    if (startAt && endAt) {
      const duelSubmissions = await Submission.find({
        roomCode: room.roomCode,
        submittedAt: {
          $gte: startAt,
          $lte: endAt,
        },
      }).lean();

      const userIds = [...new Set(duelSubmissions.map((item) => String(item.userId)))];
      const users = await User.find({ _id: { $in: userIds } })
        .select({ name: 1, email: 1, rating: 1 })
        .lean();

      const usersById = users.reduce((acc, user) => {
        acc[String(user._id)] = user;
        return acc;
      }, {});

      Object.assign(leaderboardPayload, buildDuelLeaderboard(room, duelSubmissions, usersById));
    }

    const host = await User.findById(room.hostUserId).select({ name: 1, email: 1 }).lean();
    const guest = room.guestUserId
      ? await User.findById(room.guestUserId).select({ name: 1, email: 1 }).lean()
      : null;

    return NextResponse.json({
      room: {
        roomCode: room.roomCode,
        title: room.title,
        status,
        endReason: room.endReason || "",
        durationMinutes: room.durationMinutes,
        startedAt: startAt ? startAt.toISOString() : null,
        endedAt: endAt ? endAt.toISOString() : null,
        problemsLocked,
        problemCount,
        totalPoints,
        isPrivate: room.isPrivate === true,
        host: host
          ? { id: String(host._id), name: host.name || host.email }
          : { id: String(room.hostUserId), name: "Host" },
        guest: guest
          ? { id: String(guest._id), name: guest.name || guest.email }
          : null,
        winnerUserId: room.winnerUserId ? String(room.winnerUserId) : null,
        problems: problemsLocked
          ? []
          : problemRefs.map((item) => ({
              problemSlug: item.problemSlug,
              points: Number(item.points || 1),
              title: problemBySlug[item.problemSlug]?.title || item.problemSlug,
              difficulty: problemBySlug[item.problemSlug]?.difficulty || null,
              rating: problemBySlug[item.problemSlug]?.rating || null,
            })),
      },
      leaderboard: leaderboardPayload.rows || [],
      winner: leaderboardPayload.winner || null,
    });
  } catch (error) {
    console.error("Failed to fetch duel room:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}
