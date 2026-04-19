"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 px-6 pb-8">
      <div className="mx-auto max-w-7xl rounded-2xl border-2 border-black bg-[#fff9d0] p-8 shadow-[2px_2px_0_0_#000] dark:border-[#7d8fc4] dark:bg-[#141d34] dark:shadow-[2px_2px_0_0_#7d8fc4]">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-3 rounded-xl border-2 border-black bg-[#ff6b35] px-4 py-2 text-sm font-black uppercase tracking-wide text-black dark:border-[#7d8fc4] dark:bg-[#ff8a65] dark:text-[#1f1010]">
              <Image
                src="/algoryth-logo.png"
                alt="Algoryth logo"
                width={28}
                height={28}
                className="rounded-md border-2 border-black"
              />
              Algoryth
            </div>
            <p className="mt-4 max-w-lg text-sm font-medium text-black dark:text-[#dbe7ff]">
              Practice, benchmark, and ship stronger DSA solutions with database-backed problems,
              strict test suites, and execution analytics.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://github.com/dinesh-2047/Algoryth"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black dark:border-[#7d8fc4] dark:bg-[#10182d] dark:text-[#dbe7ff]"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black dark:border-[#7d8fc4] dark:bg-[#10182d] dark:text-[#dbe7ff]"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-black dark:text-[#9ac9ff]">
              Explore
            </h4>
            <div className="grid gap-2 text-sm font-semibold">
              <Link href="/problems" className="neo-link text-black dark:text-[#dbe7ff]">
                Problems
              </Link>
              <Link href="/contests" className="neo-link text-black dark:text-[#dbe7ff]">
                Contests
              </Link>
              <Link href="/submissions" className="neo-link text-black dark:text-[#dbe7ff]">
                Submissions
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-black dark:text-[#9ac9ff]">
              Legal
            </h4>
            <div className="grid gap-2 text-sm font-semibold">
              <Link href="/privacy" className="neo-link text-black dark:text-[#dbe7ff]">
                Privacy
              </Link>
              <Link href="/terms" className="neo-link text-black dark:text-[#dbe7ff]">
                Terms
              </Link>
              <Link href="/support" className="neo-link text-black dark:text-[#dbe7ff]">
                Support
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-black pt-4 text-xs font-bold uppercase tracking-wide text-black dark:border-[#7d8fc4] dark:text-[#dbe7ff]">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Algoryth</span>
            <span>Neo-brutalist coding arena.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
