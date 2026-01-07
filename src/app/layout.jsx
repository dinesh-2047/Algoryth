import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Algoryth",
  description: "Practice coding problems and prepare for contests.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark:bg-black">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-amber-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-50`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <header className="sticky top-0 z-20 border-b border-black/10 bg-amber-50/90 backdrop-blur dark:border-white/10 dark:bg-black">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="flex items-center gap-4 py-3">
              <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Algoryth
              </Link>

              <div className="hidden flex-1 sm:block">
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="h-9 w-full rounded-full border border-black/10 bg-amber-50 px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-white/10"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Sign in
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wide dark:bg-black">
              <Link
                href="/"
                className="rounded-full px-3 py-2 text-zinc-700 hover:bg-amber-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/problems"
                className="rounded-full px-3 py-2 text-zinc-700 hover:bg-amber-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Problems
              </Link>
              <span className="rounded-full px-3 py-2 text-zinc-400 dark:text-zinc-600">
                Contests
              </span>
              <span className="rounded-full px-3 py-2 text-zinc-400 dark:text-zinc-600">
                Rating
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-6 py-8 dark:bg-black">{children}</main>

        <footer className="border-t border-black/10 dark:border-white/10 dark:bg-black">
          <div className="mx-auto w-full max-w-7xl px-6 py-6 text-sm text-zinc-600 dark:text-zinc-400 dark:bg-black">
            Algoryth · {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}
