const WRONG_ATTEMPT_PENALTY_MINUTES = 5;

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

  contestSubmissions.forEach((submission) => {
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
    const solvedTimeMinutes = toMinutes(solvedAt - startMs);
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
  if (total <= 1) {
    return leaderboard.map((row) => ({
      userId: row.userId,
      rank: row.rank,
      solved: row.solved,
      penalty: row.penalty,
      oldRating: Number(row.rating || 1200),
      newRating: Number(row.rating || 1200),
      delta: 0,
    }));
  }

  // Calculate actual scores (number of people beaten + half of ties)
  // rank is 1-based.
  const actualScores = leaderboard.map((row) => {
    let wins = 0;
    let ties = 0;
    for (const other of leaderboard) {
      if (other.userId === row.userId) continue;
      if (row.rank < other.rank) wins++;
      else if (row.rank === other.rank) ties++;
    }
    return wins + ties * 0.5;
  });

  const K = 300; // Rating volatility constant (max rating change per contest heavily scaling)

  return leaderboard.map((row, index) => {
    const oldRating = Number(row.rating || 1200);

    // Calculate expected score against all other players using Elo probability
    let expectedScore = 0;
    for (const other of leaderboard) {
      if (other.userId === row.userId) continue;
      const otherRating = Number(other.rating || 1200);
      expectedScore += 1 / (1 + Math.pow(10, (otherRating - oldRating) / 400));
    }

    const actualScore = actualScores[index];

    // Normalize delta by the number of matches (N-1)
    const baseDelta = (K * (actualScore - expectedScore)) / (total - 1);
    
    // Give a very small bonus for actually solving things to combat deflation over time
    const solvedBonus = row.solved > 0 ? row.solved * 2 : 0;
    
    const delta = Math.round(baseDelta + solvedBonus);
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
