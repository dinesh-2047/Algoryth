"use client";

import Link from "next/link";
import { CheckCircle2, FileText, ArrowUpFromLine } from "lucide-react";

function getDifficulty(problem) {
  if (problem.difficulty) return problem.difficulty;
  if (problem.rating < 1300) return "Easy";
  if (problem.rating < 1900) return "Medium";
  return "Hard";
}

function getDifficultyColors(difficulty) {
  if (difficulty === "Easy") return "bg-[#44d07d]";
  if (difficulty === "Medium") return "bg-[#0f92ff]";
  return "bg-[#ff6b35]";
}

export default function ProblemCard({
  problem,
  index,
  onBookmark,
  isBookmarked,
  onMoveToTop,
  isHighlighted,
}) {
  const difficulty = getDifficulty(problem);

  return (
    <div
      className={`neo-card relative h-full p-5 ${
        isHighlighted
          ? "-translate-y-1 bg-[#fff34d] dark:bg-[#29304f]"
          : "bg-[#fff9d0] dark:bg-[#202037]"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="text-2xl font-black uppercase text-black dark:text-[#fef08a]">
          #{String(index + 1).padStart(2, "0")}
        </span>
        {problem.status === "Solved" && (
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#44d07d] px-2 py-1 text-[10px] font-black uppercase text-black dark:border-[#fef08a] dark:bg-[#173924] dark:text-[#fef08a]">
            <CheckCircle2 className="h-3 w-3" />
            Solved
          </span>
        )}
      </div>

      <h3 className="text-lg font-black uppercase leading-snug text-black dark:text-[#fff9f0]">
        <Link href={`/problems/${problem.slug}`} className="hover:underline">
          {problem.title}
        </Link>
      </h3>

      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-black/70 dark:text-[#fff9f0]/70">
        {problem.id}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border-2 border-black px-3 py-1 text-xs font-black uppercase text-black dark:border-[#fef08a] dark:text-black ${getDifficultyColors(
            difficulty
          )}`}
        >
          {difficulty}
        </span>
        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black text-black dark:border-[#fef08a] dark:bg-[#151525] dark:text-[#fff9f0]">
          {problem.rating}
        </span>
      </div>

      {problem.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {problem.tags.slice(0, 4).map((tag) => (
            <span
              key={`${problem.id}-${tag}`}
              className="rounded-full border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:border-[#fef08a] dark:bg-[#151525] dark:text-[#fff9f0]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border-2 border-black bg-white p-2 dark:border-[#fef08a] dark:bg-[#151525]">
        <div>
          <div className="text-sm font-black text-black dark:text-[#fff9f0]">
            {problem.acceptanceRate || 0}%
          </div>
          <div className="text-[10px] font-bold uppercase text-black/70 dark:text-[#fff9f0]/70">
            Acceptance
          </div>
        </div>
        <div>
          <div className="text-sm font-black text-black dark:text-[#fff9f0]">
            {problem.submissions || 0}
          </div>
          <div className="text-[10px] font-bold uppercase text-black/70 dark:text-[#fff9f0]/70">
            Attempts
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link
          href={`/problems/${problem.slug}`}
          className="col-span-2 inline-flex items-center justify-center rounded-xl bg-[#0f92ff] px-3 py-2 text-xs font-black uppercase text-black dark:bg-[#fef08a]"
          title="Start solving this problem"
        >
          Solve
        </Link>
        <button
          className={`rounded-xl px-2 py-2 text-xs font-black uppercase ${
            isBookmarked
              ? "bg-[#ff6b35] text-black dark:bg-[#fef08a]"
              : "bg-white text-black dark:bg-[#151525] dark:text-[#fff9f0]"
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onBookmark?.(problem.id);
          }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
        >
          Save
        </button>
        <button
          className="rounded-xl bg-white px-2 py-2 text-xs font-black uppercase text-black dark:bg-[#151525] dark:text-[#fff9f0]"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onMoveToTop?.(problem.id);
          }}
          title="Move this problem to the top"
        >
          <ArrowUpFromLine className="mx-auto h-4 w-4" />
        </button>
      </div>

      <button
        className="mt-2 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-[11px] font-black uppercase text-black dark:bg-[#151525] dark:text-[#fff9f0]"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        title="Editorial coming soon"
      >
        <FileText className="h-3.5 w-3.5" />
        Editorial
      </button>
    </div>
  );
}
