"use client";

import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy":
      return {
        bg: "bg-emerald-100 dark:bg-emerald-900",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-300 dark:border-emerald-700",
      };
    case "Medium":
      return {
        bg: "bg-amber-100 dark:bg-amber-900",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-700",
      };
    case "Hard":
      return {
        bg: "bg-rose-100 dark:bg-rose-900",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-300 dark:border-rose-700",
      };
    default:
      return {
        bg: "bg-zinc-100 dark:bg-zinc-900",
        text: "text-zinc-700 dark:text-zinc-300",
        border: "border-zinc-300 dark:border-zinc-700",
      };
  }
}

function getCategoryColor(index) {
  const colors = [
    "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300",
    "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300",
    "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  ];
  return colors[index % colors.length];
}

export default function ProblemCard({
  problem,
  index,
  onBookmark,
  isBookmarked,
}) {
  const difficultyColor = getDifficultyColor(problem.difficulty);

  return (
    <div className="group relative h-full rounded-xl border-2 border-[#e0d5c2] bg-white p-6 transition-all duration-200 hover:shadow-lg hover:border-[#d69a44] dark:border-[#3c3347] dark:bg-[#211d27] dark:hover:border-[#f2c66f]">
      {/* Header with number and solved indicator */}
      <div className="mb-4 flex items-start justify-between">
        <span className="text-3xl font-bold text-[#c99a4c] dark:text-[#f2c66f]">
          #{String(index + 1).padStart(2, "0")}
        </span>
        {problem.status === "Solved" && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Problem title */}
      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-[#2b2116] transition-colors dark:text-[#f6ede0] group-hover:text-[#c99a4c] dark:group-hover:text-[#f2c66f]">
        <Link href={`/problems/${problem.slug}`} className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          {problem.title}
        </Link>
      </h3>

      {/* Problem ID / Slug */}
      <p className="mb-4 text-xs font-medium text-[#8a7a67] dark:text-[#b5a59c] uppercase tracking-wide">
        {problem.id}
      </p>

      {/* Difficulty badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center rounded-full border-2 px-4 py-1.5 text-xs font-semibold ${difficultyColor.text} ${difficultyColor.bg} ${difficultyColor.border}`}
        >
          ● {problem.difficulty}
        </span>
      </div>

      {/* Category/Topic badges */}
      {problem.tags && problem.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 relative z-10">
          {problem.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={`${problem.id}-${tag}`}
              className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${getCategoryColor(
                idx
              )}`}
            >
              #{tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats section with dividers */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-[#f7f0e0] p-3 dark:bg-[#2d2535] relative z-10">
        <div className="text-center">
          <div className="text-sm font-bold text-[#2b2116] dark:text-[#f6ede0]">
            {problem.acceptanceRate || "—"}%
          </div>
          <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
            Acceptance
          </div>
        </div>
        <div className="border-r border-l border-[#e0d5c2] dark:border-[#3c3347]"></div>
        <div className="text-center">
          <div className="text-sm font-bold text-[#2b2116] dark:text-[#f6ede0]">
            {problem.submissions || "0"}
          </div>
          <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
            Attempts
          </div>
        </div>
      </div>

      {/* Quick action buttons - visible on hover */}
      <div className="flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 relative z-20">
        <Link
          href={`/problems/${problem.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d69a44] px-3 py-2.5 text-xs font-bold text-[#2b1a09] transition-all hover:bg-[#c99a4c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#f2d580]"
          title="Start solving this problem"
        >
          <span>Start Solving</span>
          <span>→</span>
        </Link>
        <button
          className={`rounded-lg border-2 p-2.5 transition-all ${isBookmarked
              ? "border-[#d69a44] bg-[#d69a44]/10 text-[#d69a44] dark:border-[#f2c66f] dark:bg-[#f2c66f]/10 dark:text-[#f2c66f]"
              : "border-[#deceb7] text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmark?.(problem.id);
          }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
        >
          <svg
            className="h-4 w-4"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
        <button
          className="rounded-lg border-2 border-[#deceb7] p-2.5 text-[#5d5245] transition-all hover:bg-[#f6e9d2] dark:border-[#40364f] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          title="View editorial (coming soon)"
        >
          <FileText className="h-4 w-4" />
        </button>
      </div>

      {/* Status indicator at bottom */}
      {problem.status && (
        <div className="mt-4 pt-4 border-t border-[#e0d5c2] dark:border-[#3c3347]">
          <span className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#d69a441a] px-3 py-1 text-xs font-medium text-[#5d5245] dark:border-[#40364f] dark:bg-[#f6ede01a] dark:text-[#d7ccbe]">
            {problem.status}
          </span>
        </div>
      )}
    </div>
  );
}
