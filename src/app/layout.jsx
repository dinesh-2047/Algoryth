import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
    <html lang="en" suppressHydrationWarning className="bg-[#f8f3e6] dark:bg-[#18131f]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f8f3e6] text-[#2b2116] antialiased transition-colors duration-300 dark:bg-[#18131f] dark:text-[#f6ede0]`}
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
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <header className="sticky top-0 z-20 border-b border-[#e0d5c2] bg-[#fdf7ed]/90 backdrop-blur dark:border-[#3c3347] dark:bg-[#1f1b27]/90">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="flex items-center gap-4 py-3">
              <Link href="/" className="flex items-center">
                <Image
                  src="/algoryth-logo.png"
                  alt="Algoryth logo"
                  width={140}
                  height={60}
                  priority
                  className="h-10 w-auto"
                />
              </Link>

              <div className="hidden flex-1 sm:block">
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="h-9 w-full rounded-full border border-[#deceb7] bg-[#fdf7ed] px-4 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
                >
                  Sign in
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
              <Link
                href="/"
                className="rounded-full px-3 py-2 text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              >
                Home
              </Link>
              <Link
                href="/problems"
                className="rounded-full px-3 py-2 text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              >
                Problems
              </Link>
              <span className="rounded-full px-3 py-2 text-[#b5a08a] dark:text-[#7f748a]">
                Contests
              </span>
              <span className="rounded-full px-3 py-2 text-[#b5a08a] dark:text-[#7f748a]">
                Rating
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>

        <footer className="border-t border-[#e0d5c2] bg-[#fdf7ed] dark:border-[#3c3347] dark:bg-[#1f1b27]">
          <div className="mx-auto w-full max-w-7xl px-6 py-6 text-sm text-[#8a7a67] dark:text-[#b5a59c]">
            Algoryth · {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}
