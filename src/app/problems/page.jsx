"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";

function statusClasses(status) {
  switch (status) {
    case "Solved":
      return "bg-green-500/10 text-green-700 dark:text-green-300";
    case "Attempted":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  }
}

export default function ProblemsPage() {
  // Mock progress for now
  const problemStatuses = {
    "p-1000": "Solved",
    "p-1001": "Attempted",
    "p-2000": "Not Started"
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
          <Link href="/submissions" className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            View Submissions
          </Link>
          <Link href="/progress" className="ml-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            View Progress
          </Link>
        </div>
        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              aria-label="Search problems"
              placeholder="Search problems..."
              value={urlSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#deceb7] bg-white px-4 pr-10 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
            />
            {urlSearch && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5a08a] hover:text-[#6f6251] dark:text-[#7f748a] dark:hover:text-[#d7ccbe]"
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
        <div className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 border-b border-black/10 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-black dark:text-zinc-400">
          <div>#</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Status</div>
          <div>Tags</div>
        </div>

        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {problems.map((p, i) => (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}
              className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 px-5 py-3 hover:bg-black/2 dark:hover:bg-white/5"
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

              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                    problemStatuses[p.id] || "Not Started"
                  )}`}
                >
                  {problemStatuses[p.id] || "Not Started"}
                </span>
              </div>


      {/* Problems Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            ></div>
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

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            ></div>
          ))}
        </div>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
