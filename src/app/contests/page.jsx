"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
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

  const renderList = (label, items) => (
    <div className="space-y-3">
      <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
        {label}
      </h2>
      {items.length === 0 ? (
        <div className="neo-card p-4 text-sm text-black/70 dark:text-[#d4deff]/80">No contests</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((contest) => (
            <article key={contest.slug} className="neo-card p-5">
              <div className="inline-flex rounded-full bg-[#44d07d] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#243a34] dark:text-[#bdf5d0]">
                {contest.status}
              </div>
              <h3 className="mt-3 text-lg font-black uppercase text-black dark:text-[#eef3ff]">
                {contest.title}
              </h3>
              <ul className="mt-3 space-y-1 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
                <li>Start: {formatDate(contest.startTime)}</li>
                <li>End: {formatDate(contest.endTime)}</li>
                <li>Duration: {contest.durationMinutes} min</li>
                <li>Problems: {contest.problemCount}</li>
                <li>Rated: {contest.isRated ? "Yes" : "No"}</li>
              </ul>
              <Link
                href={`/contests/${contest.slug}`}
                className="mt-4 inline-flex rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
              >
                Open Contest
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="absolute -right-8 -top-8 h-24 w-24 rotate-12 border-2 border-black bg-[#0f92ff] dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
          Contests
        </h1>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          Real scheduled contests with leaderboard and rating updates.
        </p>
      </header>

      {loading && <div className="neo-card p-4 text-sm">Loading contests...</div>}
      {error && (
        <div className="neo-card bg-[#fff0ea] p-4 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {renderList("Live", grouped.live)}
          {renderList("Upcoming", grouped.upcoming)}
          {renderList("Ended", grouped.ended)}
        </>
      )}
    </section>
  );
}
