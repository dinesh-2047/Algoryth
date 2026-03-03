"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const linkStyle = (path) =>
    `relative group transition-all duration-300 ${
      pathname === path
        ? "text-indigo-500 dark:text-indigo-400"
        : "text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"
    }`;

  return (
    <footer className="relative w-full mt-28 overflow-hidden">

      {/* Floating Gradient Blobs */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl animate-pulse"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-[1px] bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 animate-gradient-x"
        >
          <div className="rounded-3xl bg-blue-950/80 backdrop-blur-xl dark:bg-[#120f1c]/90 shadow-2xl">

            <div className="grid gap-12 px-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
                  <Image
                    src="/algoryth-logo.png"
                    alt="Algoryth logo"
                    width={34}
                    height={34}
                    className="rounded-lg"
                  />
                  <span className="tracking-tight">Algoryth</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Elevate your competitive programming journey with curated
                  contests, intelligent rating, and structured practice.
                </p>
                <div className="mt-6 flex gap-4">
                  {[Github, Twitter, Linkedin].map((Icon, i) => (
                    <motion.a
                      key={i}
                      whileHover={{ scale: 1.15 }}
                      className="rounded-full p-2 bg-gray-100 dark:bg-[#1f1a28] text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition shadow hover:shadow-indigo-500/40"
                      href="#"
                    >
                      <Icon size={18} />
                    </motion.a>
                  ))}
                </div>
              </div>
              {/* Platform */}
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Platform
                </h4>
                <ul className="space-y-3 text-sm">
                  {[
                    { name: "Contests", path: "/contests" },
                    { name: "Bookmarks", path: "/bookmarks" },
                    { name: "Rating", path: "/rating" },
                    { name: "Submissions", path: "/Submissions" },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link href={item.path} className={linkStyle(item.path)}>
                        {item.name}
                        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Community */}
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Community
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="https://github.com/dinesh-2047/Algoryth"
                      target="_blank"
                      className="relative group text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                    >
                      GitHub
                      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>
              {/* Legal */}
              <div>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Legal
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy" className={linkStyle("/privacy")}>
                      Privacy Policy
                      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className={linkStyle("/terms")}>
                      Terms & Conditions
                      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-[#2b2436] px-4 py-0 text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-1">
              <span>
                © {new Date().getFullYear()} Algoryth. All rights reserved.
              </span>
              <span className="text-xs tracking-wide">
                Built with precision for elite problem solvers.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}