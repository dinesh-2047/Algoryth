'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatDuration(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatPenaltyMinutes(value) {
  const totalMinutes = Math.max(0, Math.floor(Number(value || 0)));
  return `${totalMinutes}m`;
}

function getStatusBadgeClass(status) {
  if (status === 'live') {
    return 'bg-[#44d07d] text-black dark:bg-[#203b2d] dark:text-[#bdf5d0]';
  }
  if (status === 'upcoming') {
    return 'bg-[#f4b35f] text-black dark:bg-[#3b2d1c] dark:text-[#ffd9a3]';
  }
  return 'bg-[#cbd5f5] text-black dark:bg-[#252f47] dark:text-[#d8e4ff]';
}

export default function ContestDetailPage() {
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remainingMs, setRemainingMs] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const params = useParams();
  const slugValue = params?.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

  const fetchContest = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!slug) {
          if (!silent) {
            setLoading(false);
            setError('Contest not found');
          }
          return;
        }

        if (silent) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
          setError('');
        }

        const response = await fetch(`/api/contests/${slug}`, { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load contest');
        }

        setContest(payload.contest || null);
        setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
      } catch (loadError) {
        if (!silent) {
          setError(loadError.message || 'Failed to load contest');
        }
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [slug]
  );

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  useEffect(() => {
    if (!contest || contest.status !== 'live') return undefined;

    const timer = window.setInterval(() => {
      fetchContest({ silent: true });
    }, 10000);

    return () => window.clearInterval(timer);
  }, [contest, fetchContest]);

  useEffect(() => {
    if (!contest) return undefined;

    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      if (contest.status === 'upcoming') {
        setRemainingMs(Math.max(0, start - now));
      } else if (contest.status === 'live') {
        setRemainingMs(Math.max(0, end - now));
      } else {
        setRemainingMs(0);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [contest]);

  const headerCountdown = useMemo(() => {
    if (!contest) return '';
    if (contest.status === 'upcoming') return `Starts in ${formatDuration(remainingMs)}`;
    if (contest.status === 'live') return `Ends in ${formatDuration(remainingMs)}`;
    return 'Contest ended';
  }, [contest, remainingMs]);

  const problemsLocked = Boolean(contest?.problemsLocked) || contest?.status === 'upcoming';
  const problemColumns = useMemo(() => {
    if (!contest) return [];
    if (!problemsLocked && Array.isArray(contest.problems) && contest.problems.length > 0) {
      return contest.problems;
    }

    const count = Number(contest.problemCount || 0);
    if (!count) return [];

    return Array.from({ length: count }, (_, index) => ({
      problemSlug: `locked-${index + 1}`,
      title: `Problem ${index + 1}`,
      points: null,
      locked: true,
    }));
  }, [contest, problemsLocked]);

  const totalPoints = useMemo(() => {
    if (!contest) return 0;
    if (Number.isFinite(Number(contest.totalPoints))) {
      return Number(contest.totalPoints);
    }
    return problemColumns.reduce((sum, item) => sum + Number(item.points || 0), 0);
  }, [contest, problemColumns]);

  const leaderboardGridStyle = useMemo(() => {
    const base = [
      '72px',
      'minmax(180px, 1.4fr)',
      '90px',
      '90px',
      '110px',
    ];
    const extras = problemColumns.map(() => 'minmax(96px, 1fr)');
    return { gridTemplateColumns: [...base, ...extras].join(' ') };
  }, [problemColumns]);

  if (loading) {
    return <div className="neo-card p-6 text-sm">Loading contest...</div>;
  }

  if (error) {
    return <div className="neo-card bg-[#fff0ea] p-6 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">{error}</div>;
  }

  if (!contest) {
    return <div className="neo-card p-6 text-sm">Contest not found.</div>;
  }

  return (
    <section className="space-y-8">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-2 border-black bg-[#0f92ff] opacity-60 dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full border-2 border-black bg-[#f4b35f] opacity-45 dark:border-[#8aa0d0] dark:bg-[#3b2d1c]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClass(contest.status)}`}>
              {contest.status}
            </div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
              {contest.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
              {contest.description || 'No description provided.'}
            </p>
            {contest.status === 'live' && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f92ff] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#fef08a]">
                <span className="inline-flex h-2 w-2 rounded-full bg-black/80" />
                Live updates {isRefreshing ? 'syncing' : 'every 10s'}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">Countdown</div>
              <div className="mt-2 text-lg font-black text-black dark:text-[#eef3ff]">{headerCountdown}</div>
              <div className="mt-1 text-xs text-black/60 dark:text-[#d4deff]/70">Start {formatDate(contest.startTime)}</div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">End {formatDate(contest.endTime)}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Duration</div>
                <div className="mt-1 text-sm font-black">{contest.durationMinutes} min</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Rated</div>
                <div className="mt-1 text-sm font-black">{contest.isRated ? 'Yes' : 'No'}</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Problems</div>
                <div className="mt-1 text-sm font-black">{problemColumns.length}</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Total Points</div>
                <div className="mt-1 text-sm font-black">{totalPoints || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div id="leaderboard" className="neo-card overflow-hidden">
            <div className="border-b border-black/20 bg-white px-5 py-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
              <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Leaderboard</h2>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-6 text-sm text-black/70 dark:text-[#d4deff]/80">
                {contest.status === 'upcoming'
                  ? 'Leaderboard opens when the contest starts.'
                  : 'No accepted submissions yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div
                    className="grid items-center gap-2 border-b border-black/10 bg-[#f5f7ff] px-5 py-3 text-[11px] font-black uppercase tracking-wide text-black/70 dark:border-[#7d8fc4]/30 dark:bg-[#0d1526] dark:text-[#d4deff]/70"
                    style={leaderboardGridStyle}
                  >
                    <div>Rank</div>
                    <div>Competitor</div>
                    <div>Score</div>
                    <div>Solved</div>
                    <div>Penalty (min)</div>
                    {problemColumns.map((problem, index) => (
                      <div key={problem.problemSlug}>
                        Q{index + 1}
                        {problem.points ? ` (${problem.points})` : ''}
                      </div>
                    ))}
                  </div>
                  <div className="divide-y divide-black/10 dark:divide-[#7d8fc4]/25">
                    {leaderboard.map((row) => {
                      const solvedMap = new Map(
                        (row.solvedProblems || []).map((item) => [item.problemSlug, item])
                      );
                      const highlight = row.rank <= 3;
                      return (
                        <div
                          key={row.userId}
                          className={`grid items-center gap-2 px-5 py-3 text-sm ${
                            highlight
                              ? 'bg-[#fff7d6] dark:bg-[#1a2033]'
                              : 'bg-white dark:bg-[#10182d]'
                          }`}
                          style={leaderboardGridStyle}
                        >
                          <div className="text-sm font-black text-black dark:text-[#eef3ff]">#{row.rank}</div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black text-black dark:text-[#eef3ff]">{row.name}</div>
                            <div className="text-xs text-black/70 dark:text-[#d4deff]/80">Rating {row.rating}</div>
                          </div>
                          <div className="text-sm font-bold text-black dark:text-[#eef3ff]">{row.score}</div>
                          <div className="text-sm font-bold text-black dark:text-[#eef3ff]">{row.solved}</div>
                          <div className="text-sm font-bold text-black dark:text-[#eef3ff]">{formatPenaltyMinutes(row.penalty)}</div>
                          {problemColumns.map((problem) => {
                            const solved = solvedMap.get(problem.problemSlug);
                            const solvedMinutes =
                              solved && typeof solved.solvedTimeMinutes === "number"
                                ? solved.solvedTimeMinutes
                                : solved?.penalty;
                            return (
                              <div
                                key={`${row.userId}-${problem.problemSlug}`}
                                className={`text-xs font-bold ${
                                  solved
                                    ? 'text-black dark:text-[#eef3ff]'
                                    : 'text-black/40 dark:text-[#d4deff]/40'
                                }`}
                              >
                                {solved ? formatPenaltyMinutes(solvedMinutes) : '--'}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="neo-card p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Problem List</h2>
            {problemsLocked && (
              <div className="mt-3 rounded-lg border border-dashed border-black/20 bg-white px-3 py-2 text-xs text-black/70 dark:border-[#7d8fc4]/40 dark:bg-[#10182d] dark:text-[#d4deff]/80">
                Problems unlock at {formatDate(contest.startTime)}.
              </div>
            )}
            <div className="mt-3 space-y-3">
              {problemColumns.length === 0 ? (
                <div className="rounded-lg border border-dashed border-black/20 bg-white px-3 py-3 text-xs text-black/60 dark:border-[#7d8fc4]/40 dark:bg-[#10182d] dark:text-[#d4deff]/70">
                  No problems configured yet.
                </div>
              ) : (
                problemColumns.map((problem, index) => (
                  <div key={problem.problemSlug} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-black text-black dark:text-[#eef3ff]">
                          Q{index + 1}. {problem.title}
                        </div>
                        <div className="mt-1 text-xs text-black/70 dark:text-[#d4deff]/80">
                          {problem.locked ? 'Locked' : problem.problemSlug}
                          {problem.points ? ` • ${problem.points} pts` : ''}
                          {problem.difficulty ? ` • ${problem.difficulty}` : ''}
                          {problem.rating ? ` • ${problem.rating}` : ''}
                        </div>
                      </div>
                      {problemsLocked ? (
                        <div className="rounded-lg border border-black/20 bg-[#cbd5f5] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/40 dark:bg-[#252f47] dark:text-[#d8e4ff]">
                          Locked
                        </div>
                      ) : (
                        <Link
                          href={`/problems/${problem.problemSlug}?contest=${contest.slug}`}
                          className="rounded-lg bg-[#0f92ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
                        >
                          Solve
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="neo-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Ranking</h2>
              <a href="#leaderboard" className="text-xs font-bold uppercase text-black/60 dark:text-[#d4deff]/70">Full table</a>
            </div>
            {leaderboard.length === 0 ? (
              <div className="mt-3 text-sm text-black/70 dark:text-[#d4deff]/80">No rankings yet.</div>
            ) : (
              <div className="mt-3 space-y-2">
                {leaderboard.slice(0, 5).map((row) => (
                  <div key={`preview-${row.userId}`} className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black text-black dark:text-[#eef3ff]">#{row.rank}</div>
                      <div className="text-xs font-bold text-black dark:text-[#eef3ff]">{row.name}</div>
                    </div>
                    <div className="text-xs font-bold text-black dark:text-[#eef3ff]">{row.score} pts</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {contest.ratingChanges?.length > 0 && (
        <div className="neo-card p-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Rating Changes</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {contest.ratingChanges.map((change) => (
              <div key={`${change.userId}-${change.rank}`} className="rounded-lg border border-black/20 bg-white p-3 text-sm dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                <div className="font-black text-black dark:text-[#eef3ff]">Rank #{change.rank}</div>
                <div className="mt-1 text-black/80 dark:text-[#d4deff]/80">
                  {change.oldRating} → {change.newRating} ({change.delta >= 0 ? '+' : ''}{change.delta})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/contests" className="inline-flex rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]">
        Back to Contests
      </Link>
    </section>
  );
}
