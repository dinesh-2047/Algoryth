const WRONG_ATTEMPT_PENALTY_MINUTES = 5;

function toMinutes(ms) {
  return Math.max(0, Math.floor(ms / 60000));
}

export function getDuelStatus(room, now = new Date()) {
  if (room?.status === "ended") return "ended";
  if (room?.status === "canceled") return "canceled";
  if (room?.status === "waiting") return "waiting";
  if (!room?.startedAt) return "waiting";
  const start = new Date(room.startedAt).getTime();
  const end = room.endedAt
    ? new Date(room.endedAt).getTime()
    : start + Number(room.durationMinutes || 60) * 60000;
  const current = now.getTime();

  if (current < start) return "waiting";
  if (current >= start && current <= end) return "live";
  return "ended";
}

export function buildDuelLeaderboard(room, submissions, usersById = {}) {
  const startMs = room?.startedAt ? new Date(room.startedAt).getTime() : null;
  const endMs = room?.endedAt
    ? new Date(room.endedAt).getTime()
    : startMs
      ? startMs + Number(room.durationMinutes || 60) * 60000
      : null;
  const problemPoints = new Map(
    (room.problems || []).map((item) => [item.problemSlug, Number(item.points || 1)])
  );
  const validProblemSlugs = new Set(problemPoints.keys());

  const duelSubmissions = (submissions || []).filter((item) =>
    item?.problemSlug && validProblemSlugs.has(item.problemSlug)
  );

  const participantUserIds = new Set(
    duelSubmissions.map((item) => String(item.userId))
  );

  const rowsByUser = new Map();
  participantUserIds.forEach((userId) => {
    const user = usersById[userId] || {};

    rowsByUser.set(userId, {
      userId,
      name: user.name || user.email || "User",
      rating: Number(user.rating || 1200),
      solved: 0,
      score: 0,
      penalty: 0,
      solvedProblems: [],
      lastSolvedAt: null,
    });
  });

  const submissionsByUserProblem = new Map();

  duelSubmissions.forEach((submission) => {
    const userId = String(submission.userId);
    const key = `${userId}::${submission.problemSlug}`;
    if (!submissionsByUserProblem.has(key)) {
      submissionsByUserProblem.set(key, []);
    }
    submissionsByUserProblem.get(key).push(submission);
  });

  submissionsByUserProblem.forEach((items, key) => {
    if (!items || items.length === 0) return;

    const [userId, problemSlug] = key.split("::");
    if (!rowsByUser.has(userId)) return;

    const sorted = items
      .slice()
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    const acceptedIndex = sorted.findIndex((entry) => entry?.verdict === "Accepted");
    if (acceptedIndex < 0) return;

    const acceptedSubmission = sorted[acceptedIndex];
    const wrongAttempts = sorted
      .slice(0, acceptedIndex)
      .filter((entry) => entry?.verdict !== "Accepted").length;

    const solvedAt = new Date(acceptedSubmission.submittedAt).getTime();
    const solvedTimeMinutes = startMs ? toMinutes(solvedAt - startMs) : 0;
    const penalty = wrongAttempts * WRONG_ATTEMPT_PENALTY_MINUTES;
    const points = problemPoints.get(problemSlug) || 1;

    const row = rowsByUser.get(userId);
    row.solved += 1;
    row.score += points;
    row.penalty += penalty;
    row.solvedProblems.push({
      problemSlug,
      points,
      solvedAt: acceptedSubmission.submittedAt,
      solvedTimeMinutes,
      penalty,
      wrongAttempts,
    });

    const previousLast = row.lastSolvedAt ? new Date(row.lastSolvedAt).getTime() : 0;
    if (solvedAt > previousLast) {
      row.lastSolvedAt = acceptedSubmission.submittedAt;
    }
  });

  const rows = Array.from(rowsByUser.values()).sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved;
    if (a.lastSolvedAt && b.lastSolvedAt) {
      const aTime = new Date(a.lastSolvedAt).getTime();
      const bTime = new Date(b.lastSolvedAt).getTime();
      if (aTime !== bTime) return aTime - bTime;
    }
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.name.localeCompare(b.name);
  });

  let rank = 0;
  rows.forEach((row, index) => {
    const prev = rows[index - 1];
    if (
      index === 0 ||
      !prev ||
      prev.solved !== row.solved ||
      prev.penalty !== row.penalty
    ) {
      rank = index + 1;
    }

    row.rank = rank;
  });

  const totalProblems = (room.problems || []).length;
  let winner = null;

  if (totalProblems > 0 && rows.length > 0) {
    const allSolved = rows.filter((row) => row.solved >= totalProblems);
    if (allSolved.length > 0) {
      allSolved.sort((a, b) => {
        const aTime = a.lastSolvedAt ? new Date(a.lastSolvedAt).getTime() : Infinity;
        const bTime = b.lastSolvedAt ? new Date(b.lastSolvedAt).getTime() : Infinity;
        return aTime - bTime;
      });
      winner = allSolved[0];
    } else {
      winner = rows[0];
    }
  }

  return {
    rows,
    winner: winner
      ? {
          userId: winner.userId,
          name: winner.name,
          solved: winner.solved,
          score: winner.score,
          lastSolvedAt: winner.lastSolvedAt,
        }
      : null,
    startMs,
    endMs,
  };
}
