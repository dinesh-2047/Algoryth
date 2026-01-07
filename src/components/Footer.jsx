import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          {/* Top */}
          <div className="grid gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Algoryth
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                A modern platform to practice algorithms, compete in contests,
                and grow as a problem solver.
              </p>
            </div>

            {/* Platform */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Platform
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/problems" className="hover:underline">
                    Problems
                  </Link>
                </li>
               
              </ul>
            </div>

            {/* Community */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Community
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/dinesh-2047/Algoryth"
                    target="_blank"
                    className="hover:underline"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Legal
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-black/10 px-6 py-4 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span>© {new Date().getFullYear()} Algoryth. All rights reserved.</span>
              <span>Built for competitive programmers.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
