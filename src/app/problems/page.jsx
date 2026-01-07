import Link from "next/link";
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Browse problems. This uses mock data + API routes.
          </p>
          <Link href="/submissions" className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            View Submissions
          </Link>
          <Link href="/progress" className="ml-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            View Progress
          </Link>
        </div>

        <div className="w-full sm:w-80">
          <input
            aria-label="Search problems"
            placeholder="Search (UI only)"
            className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-white/10"
          />
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

        <div className="divide-y divide-black/10 dark:divide-white/10">
          {problems.map((p, i) => (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}
              className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 px-5 py-3 hover:bg-black/2 dark:hover:bg-white/5"
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

              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${difficultyClasses(
                    p.difficulty
                  )}`}
                >
                  {p.difficulty}
                </span>
              </div>

              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                    problemStatuses[p.id] || "Not Started"
                  )}`}
                >
                  {problemStatuses[p.id] || "Not Started"}
                </span>
              </div>

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
      </div>

    </section>
  );
}
