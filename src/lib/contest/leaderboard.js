function toMinutes(ms) {
  return Math.max(0, Math.floor(ms / 60000));
}

export function getContestStatus(contest, now = new Date()) {
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();
  const current = now.getTime();

  if (current < start) return "upcoming";
  if (current >= start && current <= end) return "live";
  return "ended";
}

export function buildContestLeaderboard(contest, submissions, usersById = {}) {
  const startMs = new Date(contest.startTime).getTime();
  const problemPoints = new Map(
    (contest.problems || []).map((item) => [item.problemSlug, Number(item.points || 1)])
  );
  const validProblemSlugs = new Set(problemPoints.keys());

  const contestSubmissions = (submissions || []).filter((item) =>
    item?.problemSlug && validProblemSlugs.has(item.problemSlug)
  );

  const participantUserIds = new Set(
    contestSubmissions.map((item) => String(item.userId))
  );

  const acceptedSorted = contestSubmissions
    .filter((item) => item?.verdict === "Accepted" && validProblemSlugs.has(item.problemSlug))
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  const firstAcceptedByUserProblem = new Map();

  acceptedSorted.forEach((submission) => {
    const userId = String(submission.userId);
    const key = `${userId}::${submission.problemSlug}`;
    if (!firstAcceptedByUserProblem.has(key)) {
      firstAcceptedByUserProblem.set(key, submission);
    }
  });

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

  firstAcceptedByUserProblem.forEach((submission) => {
    const userId = String(submission.userId);
    const solvedAt = new Date(submission.submittedAt).getTime();
    const penalty = toMinutes(solvedAt - startMs);
    const points = problemPoints.get(submission.problemSlug) || 1;

    if (!rowsByUser.has(userId)) return;

    const row = rowsByUser.get(userId);
    row.solved += 1;
    row.score += points;
    row.penalty += penalty;
    row.solvedProblems.push({
      problemSlug: submission.problemSlug,
      points,
      solvedAt: submission.submittedAt,
      penalty,
    });

    const previousLast = row.lastSolvedAt ? new Date(row.lastSolvedAt).getTime() : 0;
    if (solvedAt > previousLast) {
      row.lastSolvedAt = submission.submittedAt;
    }
  });

  const rows = Array.from(rowsByUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.name.localeCompare(b.name);
  });

  let rank = 0;
  rows.forEach((row, index) => {
    const prev = rows[index - 1];
    if (
      index === 0 ||
      !prev ||
      prev.score !== row.score ||
      prev.penalty !== row.penalty
    ) {
      rank = index + 1;
    }

    row.rank = rank;
  });

  return rows;
}

export function computeRatingChanges(leaderboard) {
  const total = leaderboard.length;
  if (total === 0) return [];

  return leaderboard.map((row, index) => {
    const n = Math.max(1, total - 1);
    const percentile = total === 1 ? 0.5 : 1 - index / n;

    const performanceComponent = (percentile - 0.5) * 2;
    const solvedBoost = Math.min(0.35, row.solved * 0.08);
    const baseDelta = (performanceComponent + solvedBoost) * 70;

    const delta = Math.round(baseDelta);
    const oldRating = Number(row.rating || 1200);
    const newRating = Math.max(800, oldRating + delta);

    return {
      userId: row.userId,
      rank: row.rank,
      solved: row.solved,
      penalty: row.penalty,
      oldRating,
      newRating,
      delta: newRating - oldRating,
    };
  });
}
