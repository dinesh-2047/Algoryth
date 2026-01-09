"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { problems } from "../../lib/problems";

function difficultyClasses(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "Medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "Hard":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    default:
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
  }
}

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProblems = useMemo(() => {
    if (!searchTerm.trim()) {
      return problems;
    }

    return problems.filter(problem =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
            Problems
          </h1>
          <p className="mt-1 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Browse problems. This uses mock data + API routes.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              aria-label="Search problems"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#deceb7] bg-white px-4 pr-10 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="grid grid-cols-[56px_1.2fr_.45fr_.9fr] gap-4 border-b border-black/10 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-black dark:text-zinc-400">
          <div>#</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Tags</div>
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
          {filteredProblems.map((p, i) => (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}
              className="grid grid-cols-[56px_1.2fr_.45fr_.9fr] gap-4 px-5 py-3 hover:bg-black/2 dark:hover:bg-white/5"
            >
              <div className="flex items-center text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  {p.title}
                </div>
                <div className="mt-1 text-xs text-[#b5a08a] dark:text-[#b5a59c]">
                  {p.id}
                </div>
              </div>

              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${difficultyClasses(
                    p.difficulty
                  )}`}
                >
                  {p.difficulty}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span
                    key={`${p.id}-${t}`}
                    className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#f2e3cc] px-2.5 py-1 text-xs text-[#5d5245] dark:border-[#40364f] dark:bg-[#2d2535] dark:text-[#d7ccbe]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
}
