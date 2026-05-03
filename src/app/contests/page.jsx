"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function getStatusBadgeClass(status) {
  if (status === "live") {
    return "bg-[#44d07d] text-black dark:bg-[#203b2d] dark:text-[#bdf5d0]";
  }
  if (status === "upcoming") {
    return "bg-[#f4b35f] text-black dark:bg-[#3b2d1c] dark:text-[#ffd9a3]";
  }
  return "bg-[#cbd5f5] text-black dark:bg-[#252f47] dark:text-[#d8e4ff]";
}

function getStatusGlowClass(status) {
  if (status === "live") {
    return "from-[#2dd4bf]/55 via-transparent to-transparent";
  }
  if (status === "upcoming") {
    return "from-[#f4b35f]/55 via-transparent to-transparent";
  }
  return "from-[#94a3b8]/40 via-transparent to-transparent";
}

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/contests", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load contests");
        }

        setContests(Array.isArray(payload.contests) ? payload.contests : []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load contests");
      } finally {
        setLoading(false);
      }
    };

    loadContests();
  }, []);

  const grouped = useMemo(() => {
    return {
      live: contests.filter((contest) => contest.status === "live"),
      upcoming: contests.filter((contest) => contest.status === "upcoming"),
      ended: contests.filter((contest) => contest.status === "ended"),
    };
  }, [contests]);

  const spotlight = useMemo(() => {
    return [...grouped.live, ...grouped.upcoming].slice(0, 2);
  }, [grouped.live, grouped.upcoming]);

  const renderContestRow = (contest, ctaLabel) => (
    <Link
      key={contest.slug}
      href={`/contests/${contest.slug}`}
      className="block w-full group neo-card relative overflow-hidden p-4 transition-transform hover:-translate-y-0.5"
    >
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getStatusGlowClass(contest.status)}`} />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClass(contest.status)}`}>
            {contest.status}
          </div>
          <h3 className="mt-3 text-base font-black uppercase text-black dark:text-[#eef3ff]">
            {contest.title}
          </h3>
          <div className="mt-1 text-xs font-semibold text-black/70 dark:text-[#d4deff]/80">
            {formatDate(contest.startTime)} • {contest.durationMinutes} min • {contest.problemCount} problems
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-black dark:text-[#eef3ff] sm:justify-end">
          <span className="rounded-full border border-black/10 bg-white px-2 py-1 dark:border-[#7d8fc4]/40 dark:bg-[#10182d]">
            {contest.isRated ? "Rated" : "Unrated"}
          </span>
          {contest.status === "ended" && (
            <span className="rounded-full border border-black/10 bg-white px-2 py-1 dark:border-[#7d8fc4]/40 dark:bg-[#10182d]">
              {contest.ratingProcessedAt ? "Final" : "Pending"}
            </span>
          )}
          <span className="rounded-full bg-[#0f92ff] px-3 py-1 text-black dark:bg-[#fef08a]">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="space-y-8">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-2 border-black bg-[#0f92ff] opacity-60 dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full border-2 border-black bg-[#f4b35f] opacity-50 dark:border-[#8aa0d0] dark:bg-[#3b2d1c]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white dark:bg-[#0b1222]">
              Algoryth Contest Arena
            </div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
              Contests
            </h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
              Weekly battles, ranked leaderboards, and private-problem lineups designed for speed.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">Live Now</div>
              <div className="mt-2 text-2xl font-black">{grouped.live.length}</div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">Contests in progress</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">Upcoming</div>
              <div className="mt-2 text-2xl font-black">{grouped.upcoming.length}</div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">Scheduled contests</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">History</div>
              <div className="mt-2 text-2xl font-black">{grouped.ended.length}</div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">Past competitions</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">Rated</div>
              <div className="mt-2 text-2xl font-black">
                {contests.filter((contest) => contest.isRated).length}
              </div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">Ranking updates</div>
            </div>
          </div>
        </div>
      </header>

      {loading && <div className="neo-card p-4 text-sm">Loading contests...</div>}
      {error && (
        <div className="neo-card bg-[#fff0ea] p-4 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            {spotlight.length === 0 ? (
              <div className="neo-card p-5 text-sm text-black/70 dark:text-[#d4deff]/80">
                No featured contests yet.
              </div>
            ) : (
              spotlight.map((contest) => (
                <Link
                  key={contest.slug}
                  href={`/contests/${contest.slug}`}
                  className="block w-full neo-card group relative overflow-hidden p-6"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getStatusGlowClass(contest.status)}`} />
                  <div className="relative">
                    <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClass(contest.status)}`}>
                      {contest.status}
                    </div>
                    <h2 className="mt-4 text-xl font-black uppercase text-black dark:text-[#eef3ff]">
                      {contest.title}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-black/70 dark:text-[#d4deff]/80">
                      {formatDate(contest.startTime)} • {contest.durationMinutes} min • {contest.problemCount} problems
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]">
                      Enter Contest
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Live & Upcoming</h2>
                <span className="text-xs font-semibold text-black/60 dark:text-[#d4deff]/70">Stay ready</span>
              </div>
              <div className="space-y-3">
                {[...grouped.live, ...grouped.upcoming].length === 0 ? (
                  <div className="neo-card p-4 text-sm text-black/70 dark:text-[#d4deff]/80">No upcoming contests</div>
                ) : (
                  [...grouped.live, ...grouped.upcoming].map((contest) =>
                    renderContestRow(contest, contest.status === "live" ? "Join" : "Remind")
                  )
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Contest History</h2>
                <span className="text-xs font-semibold text-black/60 dark:text-[#d4deff]/70">Results & ratings</span>
              </div>
              <div className="space-y-3">
                {grouped.ended.length === 0 ? (
                  <div className="neo-card p-4 text-sm text-black/70 dark:text-[#d4deff]/80">No contest history yet</div>
                ) : (
                  grouped.ended.map((contest) => renderContestRow(contest, "Results"))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
