"use client";

import { useEffect, useState, useMemo } from "react";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch('/api/submissions')
      .then(res => res.json())
      .then(data => setSubmissions(data));
  }, []);

  const filtered = useMemo(() => {
    return submissions.filter(s => s.problemId.includes(filter) || s.status.includes(filter));
  }, [filter, submissions]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View your past submissions.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by problem or status"
            className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-white/10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="grid grid-cols-[1fr_.5fr_.5fr] gap-4 border-b border-black/10 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-black dark:text-zinc-400">
          <div>Problem</div>
          <div>Status</div>
          <div>Timestamp</div>
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
          {filtered.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_.5fr_.5fr] gap-4 px-5 py-3">
              <div className="text-sm font-semibold">{s.problemId}</div>
              <div className="text-sm">{s.status}</div>
              <div className="text-sm text-zinc-500">{new Date(s.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
