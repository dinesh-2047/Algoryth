"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function RatingPage() {
  const { user, loading } = useAuth();

  const history = useMemo(() => {
    if (!user?.contestRatingHistory) return [];
    return [...user.contestRatingHistory].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [user]);

  if (loading) {
    return <div className="neo-card p-6 text-sm">Loading rating...</div>;
  }

  if (!user) {
    return (
      <div className="neo-card p-6 text-sm">
        Login to view your rating dashboard. <Link href="/auth" className="underline">Sign in</Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="neo-card p-6">
        <h1 className="text-2xl font-black uppercase text-black dark:text-[#eef3ff]">Rating</h1>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          Contest rating updates follow rank and solved-score performance.
        </p>

        <div className="mt-4 inline-flex rounded-lg bg-[#0f92ff] px-5 py-3 text-lg font-black uppercase tracking-wide text-black dark:bg-[#fef08a]">
          Current Rating: {user.rating || 1200}
        </div>
      </header>

      <div className="neo-card overflow-hidden">
        <div className="border-b border-black/20 bg-white px-5 py-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
            Contest Rating History
          </h2>
        </div>

        {history.length === 0 ? (
          <div className="p-6 text-sm text-black/70 dark:text-[#d4deff]/80">
            No rating updates yet. Join rated contests to build your graph.
          </div>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-[#7d8fc4]/30">
            {history.map((entry) => (
              <div key={`${entry.contestSlug}-${entry.updatedAt}`} className="grid gap-2 px-5 py-3 md:grid-cols-[minmax(0,2fr)_120px_120px_120px] md:items-center">
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-black dark:text-[#eef3ff]">
                    {entry.contestTitle || entry.contestSlug}
                  </div>
                  <div className="text-xs text-black/70 dark:text-[#d4deff]/80">
                    Rank #{entry.rank || "-"} • {new Date(entry.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm font-bold text-black dark:text-[#eef3ff]">
                  {entry.oldRating} → {entry.newRating}
                </div>
                <div className={`text-sm font-black ${entry.delta >= 0 ? "text-[#1f7a3f] dark:text-[#8ff0b8]" : "text-[#a2481a] dark:text-[#ffc8b2]"}`}>
                  {entry.delta >= 0 ? "+" : ""}{entry.delta}
                </div>
                <div>
                  <Link
                    href={`/contests/${entry.contestSlug}`}
                    className="inline-flex rounded-lg bg-[#44d07d] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black"
                  >
                    Open Contest
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
