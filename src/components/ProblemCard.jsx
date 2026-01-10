"use client";

import { useState } from "react";
import Link from "next/link";

function difficultyConfig(difficulty) {
  switch (difficulty) {
    case "Easy":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-500/30",
      };
    case "Medium":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-500/30",
      };
    case "Hard":
      return {
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-500/30",
      };
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
        text: "text-zinc-700 dark:text-zinc-300",
        border: "border-zinc-500/30",
      };
  }
}

const tagColors = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
];

function getTagColor(index) {
  return tagColors[index % tagColors.length];
}

export default function ProblemCard({ problem, index }) {
  const [isBookmarked, setIsBookmarked] = useState(problem.bookmarked);
  const diffConfig = difficultyConfig(problem.difficulty);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#e0d5c2] bg-white p-5 transition-all duration-200 hover:border-[#d69a44] hover:shadow-lg dark:border-[#3c3347] dark:bg-[#211d27] dark:hover:border-[#f2c66f]">
      {/* Solved Badge - Top Right Corner */}
      {problem.solved && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 dark:bg-emerald-500/20">
          <svg
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Solved
          </span>
        </div>
      )}

      {/* Bookmark Button - Top Right (when not solved) */}
      {!problem.solved && (
        <button
          onClick={handleBookmark}
          className="absolute right-3 top-3 rounded-lg p-1.5 transition-colors hover:bg-[#f6e9d2] dark:hover:bg-[#2d2535]"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <svg
            className={`h-5 w-5 transition-colors ${
              isBookmarked
                ? "fill-[#d69a44] text-[#d69a44] dark:fill-[#f2c66f] dark:text-[#f2c66f]"
                : "text-[#b5a08a] dark:text-[#7f748a]"
            }`}
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isBookmarked ? "0" : "2"}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      )}

      {/* Problem Number */}
      <div className="mb-3 text-xs font-semibold text-[#8a7a67] dark:text-[#b5a59c]">
        #{String(index + 1).padStart(3, "0")}
      </div>

      {/* Title */}
      <Link href={`/problems/${problem.slug}`} className="block">
        <h3 className="mb-2 text-lg font-semibold text-[#2b2116] transition-colors group-hover:text-[#d69a44] dark:text-[#f6ede0] dark:group-hover:text-[#f2c66f]">
          {problem.title}
        </h3>
      </Link>

      {/* Difficulty and Stats Row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border}`}
        >
          {problem.difficulty}
        </span>

        <div className="flex items-center gap-1 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{problem.acceptanceRate}%</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>{formatNumber(problem.submissions)} submissions</span>
        </div>
      </div>

      {/* Category Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {problem.tags.map((tag, idx) => (
          <span
            key={`${problem.id}-${tag}`}
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${getTagColor(
              idx
            )}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/problems/${problem.slug}`}
          className="flex-1 rounded-lg bg-[#d69a44] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#c08935] focus:outline-none focus:ring-2 focus:ring-[#d69a44]/50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e0b659]"
        >
          Start Solving
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement editorial view
            alert("Editorial feature coming soon!");
          }}
          className="flex-1 rounded-lg border border-[#deceb7] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#5d5245] transition-all hover:bg-[#f6e9d2] focus:outline-none focus:ring-2 focus:ring-[#d69a44]/30 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
        >
          View Editorial
        </button>
      </div>
    </div>
  );
}
