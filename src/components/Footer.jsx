import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-white dark:border-[#3c3347] dark:bg-[#211d27]">
          {/* Top */}
          <div className="grid gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
                <Image
                  src="/algoryth-logo.png"
                  alt="Algoryth logo"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <span>Algoryth</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6f6251] dark:text-[#b5a59c]">
                A modern platform to practice algorithms, compete in contests,
                and grow as a problem solver.
              </p>
            </div>

            {/* Platform */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
                Platform
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/problems" className="text-[#5d5245] hover:underline dark:text-[#d7ccbe]">
                    Problems
                  </Link>
                </li>
               
              </ul>
            </div>

            {/* Community */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
                Community
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/dinesh-2047/Algoryth"
                    target="_blank"
                    className="text-[#5d5245] hover:underline dark:text-[#d7ccbe]"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
                Legal
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-[#5d5245] hover:underline dark:text-[#d7ccbe]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[#5d5245] hover:underline dark:text-[#d7ccbe]">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#e0d5c2] px-6 py-4 text-sm text-[#8a7a67] dark:border-[#3c3347] dark:text-[#b5a59c]">
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
