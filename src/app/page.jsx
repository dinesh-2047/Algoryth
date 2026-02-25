'use client';

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [totalSolved, setTotalSolved] = useState(0);
  const [streak] = useState(4);

  const TOTAL_PROBLEMS = 300;

  useEffect(() => {
    try {
      const raw = localStorage.getItem('algoryth_submissions');
      const parsed = raw ? JSON.parse(raw) : [];
      const uniqueSolved = new Set(
        parsed.filter((s) => s.status === 'Accepted').map((s) => s.problemId)
      );
      setTotalSolved(uniqueSolved.size);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const solvedPercent = Math.min(
    Math.round((totalSolved / TOTAL_PROBLEMS) * 100),
    100
  );

  const cardHover =
    "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300";

  return (
    <div className="relative">

      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-amber-400/20 rounded-full blur-3xl animate-pulse top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse bottom-[-200px] right-[-200px]" />
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* LEFT SECTION */}
        <div className="grid gap-6">

          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl p-8 bg-gradient-to-br from-amber-400/20 to-orange-500/10 backdrop-blur-xl border border-amber-200/30 dark:border-amber-900/30 ${cardHover}`}
          >
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
              Welcome to Algoryth 🚀
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">
              Sharpen your coding skills. Master DSA. Prepare for interviews like a pro.
            </p>

            <Link
              href="/problems"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 transition-all duration-300"
            >
              Start Solving
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame size={18} className="text-orange-500" />
              Recommended Problems
            </h2>

            {[
              { title: "Two Sum", slug: "two-sum", diff: "Easy" },
              { title: "Valid Parentheses", slug: "valid-parentheses", diff: "Easy" },
              { title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-100/40 dark:hover:bg-zinc-800 transition-all duration-300"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                  {p.diff}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* Learn Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`rounded-3xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-indigo-200/30 dark:border-indigo-900/30 ${cardHover}`}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-500" />
              DSA Roadmap
            </h2>

            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>• Topic-wise learning path</li>
              <li>• Curated problems</li>
              <li>• Interview preparation</li>
            </ul>

            <Link
              href="/topics"
              className="mt-5 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Explore Roadmap <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <div className="font-semibold mb-4">Achievements</div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Flame, label: "3 Day Streak", color: "text-orange-500" },
                { icon: Trophy, label: "50 Solved", color: "text-yellow-500" },
                { icon: BookOpen, label: "DSA Master", color: "text-indigo-500" },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800"
                >
                  <badge.icon className={badge.color} size={22} />
                  <span className="text-xs">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="grid gap-6">

          {/* Contest Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Trophy size={18} className="text-yellow-500" />
              Weekly Contest
            </div>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Algoryth Practice Round is live now!
            </p>

            <button className="mt-4 w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 py-2 text-sm font-semibold text-white hover:scale-105 transition-all duration-300">
              Register Soon
            </button>
          </motion.div>

          {/* Daily Streak */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Flame size={18} className="text-orange-500" />
              Daily Streak
            </div>

            <div className="mt-4 text-3xl font-bold text-orange-500">
              {streak} 🔥
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Solve 1 problem daily to maintain streak.
            </p>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Trophy size={18} className="text-yellow-500" />
              Leaderboard
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {[
                { name: "Aarav", score: 1200 },
                { name: "Riya", score: 1100 },
                { name: user?.name || "You", score: 910 },
              ].map((player, index) => (
                <div
                  key={index}
                  className={`flex justify-between p-2 rounded-lg ${
                    player.name === user?.name
                      ? "bg-amber-100 dark:bg-zinc-800 font-semibold"
                      : ""
                  }`}
                >
                  <span>#{index + 1} {player.name}</span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>

            <Link
              href="/leaderboard"
              className="mt-4 inline-block text-sm text-amber-600 hover:underline"
            >
              View Full Leaderboard →
            </Link>
          </motion.div>

          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 ${cardHover}`}
          >
            <div className="text-lg font-semibold">
              {user ? user.name : "Guest"}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Rating</span>
                <span className="font-semibold">910</span>
              </div>

              <div className="flex justify-between">
                <span>Solved</span>
                <motion.span
                  key={totalSolved}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="font-semibold text-amber-600"
                >
                  {totalSolved}
                </motion.span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{solvedPercent}%</span>
              </div>

              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${solvedPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <Link href="/dashboard" className="block hover:text-amber-600 transition">
                My Dashboard
              </Link>
              <Link href="/bookmarks" className="block hover:text-amber-600 transition">
                Bookmarks
              </Link>
              <Link href="/submissions" className="block hover:text-amber-600 transition">
                Submissions
              </Link>
              <Link href="/settings" className="block hover:text-amber-600 transition">
                Settings
              </Link>
            </div>
          </motion.div>

        </aside>
      </section>
    </div>
  );
}