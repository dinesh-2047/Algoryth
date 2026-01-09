"use client";

import { useEffect, useState } from "react";

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetch('/api/users/default/progress')
      .then(res => res.json())
      .then(data => setProgress(data));
  }, []);

  if (!progress) return <div>Loading...</div>;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Track your solving progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completion</div>
          <div className="mt-2 text-3xl font-bold">{progress.completionPercentage}%</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Current Streak</div>
          <div className="mt-2 text-3xl font-bold">{progress.streak} days</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Difficulty Breakdown</div>
          <div className="mt-2 space-y-1 text-sm">
            <div>Easy: {progress.difficultyBreakdown.Easy}</div>
            <div>Medium: {progress.difficultyBreakdown.Medium}</div>
            <div>Hard: {progress.difficultyBreakdown.Hard}</div>
          </div>
        </div>
      </div>
    </section>
  );
}