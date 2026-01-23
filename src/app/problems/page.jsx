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
    <section className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
            Problems
          </h1>
          <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Master data structures & algorithms with curated problems
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
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
              <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.title}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {p.id}
                </div>
              </div>
              <p className="mt-1 text-sm text-[#6b5d4a] dark:text-[#bfb4c6]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ProblemCard
              problem={{ ...dailyProblem, tags: [...(dailyProblem.tags || []), "daily"] }}
              index={0}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedProblems.includes(dailyProblem.id)}
            />
          </div>
        </div>
      )}

              <div className="flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span
                    key={`${p.id}-${t}`}
                    className="inline-flex items-center rounded-full border border-black/10 bg-black/3 px-2.5 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProblems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={index}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedProblems.includes(problem.id)}
            />
          ))}
        </div>
      )}

      {!loading && displayProblems.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl bg-[#f7f0e0] dark:bg-[#292331]">
          <h3 className="text-xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
            No Problems Found
          </h3>
          <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </section>
  );
}
