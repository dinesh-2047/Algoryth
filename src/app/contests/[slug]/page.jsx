'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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

export default function ContestDetailPage({ params }) {
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remainingMs, setRemainingMs] = useState(0);

  const slug = params.slug;

  useEffect(() => {
    const loadContest = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/contests/${slug}`, { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load contest');
        }

        setContest(payload.contest || null);
        setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load contest');
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [slug]);

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
    <section className="space-y-6">
      <header className="neo-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-[#44d07d] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#243a34] dark:text-[#bdf5d0]">
              {contest.status}
            </div>
            <h1 className="mt-3 text-2xl font-black uppercase text-black dark:text-[#eef3ff]">{contest.title}</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">{contest.description || 'No description provided.'}</p>
          </div>
          <div className="rounded-lg bg-[#0f92ff] px-4 py-2 text-sm font-black uppercase tracking-wide text-black dark:bg-[#fef08a]">
            {headerCountdown}
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm font-semibold text-black/80 dark:text-[#d4deff]/80 md:grid-cols-2">
          <div>Start: {formatDate(contest.startTime)}</div>
          <div>End: {formatDate(contest.endTime)}</div>
          <div>Duration: {contest.durationMinutes} min</div>
          <div>Rated: {contest.isRated ? 'Yes' : 'No'}</div>
        </div>
      </header>

      <div className="neo-card p-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Problems</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {(contest.problems || []).map((problem) => (
            <div key={problem.problemSlug} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
              <div className="text-sm font-black text-black dark:text-[#eef3ff]">{problem.title}</div>
              <div className="mt-1 text-xs text-black/70 dark:text-[#d4deff]/80">
                {problem.problemSlug} • {problem.points} points
                {problem.difficulty ? ` • ${problem.difficulty}` : ''}
                {problem.rating ? ` • Rating ${problem.rating}` : ''}
              </div>
              <Link
                href={`/problems/${problem.problemSlug}?contest=${contest.slug}`}
                className="mt-2 inline-flex rounded-lg bg-[#0f92ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
              >
                Open Problem
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="neo-card overflow-hidden">
        <div className="border-b border-black/20 bg-white px-5 py-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Leaderboard</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-6 text-sm text-black/70 dark:text-[#d4deff]/80">No accepted submissions yet.</div>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-[#7d8fc4]/30">
            {leaderboard.map((row) => (
              <div key={row.userId} className="grid gap-2 px-5 py-3 md:grid-cols-[80px_minmax(0,2fr)_100px_100px_120px] md:items-center">
                <div className="text-sm font-black text-black dark:text-[#eef3ff]">#{row.rank}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-black dark:text-[#eef3ff]">{row.name}</div>
                  <div className="text-xs text-black/70 dark:text-[#d4deff]/80">Rating {row.rating}</div>
                </div>
                <div className="text-sm font-bold text-black dark:text-[#eef3ff]">Score {row.score}</div>
                <div className="text-sm font-bold text-black dark:text-[#eef3ff]">Solved {row.solved}</div>
                <div className="text-sm font-bold text-black dark:text-[#eef3ff]">Penalty {row.penalty}</div>
              </div>
            ))}
          </div>
        )}
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
