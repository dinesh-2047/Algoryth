import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-black/10 bg-zinc-50 px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Announcement
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Welcome to Algoryth
            </h1>
          </div>

          <div className="px-6 py-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Start with the problems and solve a few easy ones.

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/problems"
                className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Go to Problems
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-black/10 bg-zinc-50 px-6 py-4 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Quick start
            </div>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Recommended problems
            </div>
          </div>

          <div className="divide-y divide-black/10 dark:divide-white/10">
            {[
              { title: "Two Sum", slug: "two-sum", diff: "Easy" },
              { title: "Valid Parentheses", slug: "valid-parentheses", diff: "Easy" },
              { title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="flex items-center justify-between px-6 py-4 text-sm hover:bg-black/2 dark:hover:bg-white/5"
              >
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.diff}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <aside className="grid gap-4">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-black/10 bg-zinc-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Pay attention</div>
          </div>
          <div className="px-5 py-5">
            <div className="text-sm font-medium">Contest is running</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Algoryth Weekly · Practice Round
            </div>
            <button
              type="button"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-black/3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Register (soon)
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-black/10 bg-zinc-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Guest</div>
          </div>
          <div className="px-5 py-5 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-zinc-700 dark:text-zinc-300">Rating</div>
              <div className="font-semibold">910</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-zinc-700 dark:text-zinc-300">Contribution</div>
              <div className="font-semibold">0</div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
  <Link href="/settings" className="text-zinc-500 hover:underline">
    Settings
  </Link>
  <Link href="/submissions" className="text-zinc-500 hover:underline">
    Submissions
  </Link>
  <Link href="/contests" className="text-zinc-500 hover:underline">
    Contests
  </Link>
</div>

          </div>
        </div>
      </aside>
    </section>
  );
}
