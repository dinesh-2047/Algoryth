import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-6 py-4 dark:border-[#3c3347] dark:bg-[#292331]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
              Announcement
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
              Welcome to Algoryth
            </h1>
          </div>

          <div className="px-6 py-5 text-sm leading-6 text-[#5d5245] dark:text-[#d7ccbe]">
            Start with the problems and solve a few easy ones.

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/problems"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#d69a44] px-5 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
              >
                Go to Problems
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-6 py-4 dark:border-[#3c3347] dark:bg-[#292331]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
              Quick start
            </div>
            <div className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
              Recommended problems
            </div>
          </div>

          <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
            {[
              { title: "Two Sum", slug: "two-sum", diff: "Easy" },
              { title: "Valid Parentheses", slug: "valid-parentheses", diff: "Easy" },
              { title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[#f2e3cc] dark:hover:bg-[#2d2535]"
              >
                <div className="font-medium text-[#2b2116] dark:text-[#f6ede0]">{p.title}</div>
                <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">{p.diff}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <aside className="grid gap-4">
        <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-5 py-4 dark:border-[#3c3347] dark:bg-[#292331]">
            <div className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Pay attention</div>
          </div>
          <div className="px-5 py-5">
            <div className="text-sm font-medium text-[#2b2116] dark:text-[#f6ede0]">Contest is running</div>
            <div className="mt-1 text-sm text-[#6f6251] dark:text-[#b5a59c]">
              Algoryth Weekly · Practice Round
            </div>
            <button
              type="button"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-[#fff8ed] px-4 text-sm font-medium text-[#5d5245] hover:bg-[#f2e3cc] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            >
              Register (soon)
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-5 py-4 dark:border-[#3c3347] dark:bg-[#292331]">
            <div className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Guest</div>
          </div>
          <div className="px-5 py-5 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-[#5d5245] dark:text-[#d7ccbe]">Rating</div>
              <div className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">910</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[#5d5245] dark:text-[#d7ccbe]">Contribution</div>
              <div className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">0</div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <span className="text-[#8a7a67] dark:text-[#b5a59c]">Settings</span>
              <span className="text-[#8a7a67] dark:text-[#b5a59c]">Submissions</span>
              <span className="text-[#8a7a67] dark:text-[#b5a59c]">Contests</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
