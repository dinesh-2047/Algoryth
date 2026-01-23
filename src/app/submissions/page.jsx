"use client";

import { useEffect, useState } from "react";

export default function SubmissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to read any locally stored submissions for a basic placeholder
    try {
      const raw = localStorage.getItem("algoryth_submissions");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      // ignore parsing errors
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e0d5c2] dark:border-[#3c3347]">
      <h1 className="text-2xl font-semibold mb-4">Submissions</h1>

      {loading ? (
        <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[#e0d5c2] dark:border-[#3c3347] p-6 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
          <p>No submissions yet. Run or submit code from a problem to see entries here.</p>
          <p className="mt-2">A richer view will be available once the submissions API is added.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#e0d5c2] dark:border-[#3c3347]">
          <div className="grid grid-cols-4 gap-0 bg-[#f7f0e0] dark:bg-[#292331] text-xs font-semibold px-4 py-2">
            <div>Problem</div>
            <div>Status</div>
            <div>Language</div>
            <div>When</div>
          </div>
          <ul className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
            {items.map((s, idx) => (
              <li key={idx} className="grid grid-cols-4 px-4 py-3 text-sm">
                <div className="truncate">{s.problemTitle || s.problemId}</div>
                <div>{s.status || "—"}</div>
                <div>{s.language || "—"}</div>
                <div>{s.timestamp ? new Date(s.timestamp).toLocaleString() : "—"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
