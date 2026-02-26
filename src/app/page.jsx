'use client';

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      setStats(prev => ({ ...prev, total: uniqueSolved.size }));
      setTotalSolved(uniqueSolved.size); // eslint-disable-line react-hooks/set-state-in-effect
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
    <div className="space-y-16 pb-20">

      {/* ================= HERO ================= */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 p-12 text-white shadow-[0_20px_60px_rgba(99,102,241,0.4)]"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Master Data Structures <br /> & Algorithms
          </h1>

          <p className="mt-5 text-lg text-white/90">
            Solve problems, boost your rating, and crack top tech interviews
            with structured learning paths.
          </p>

          <div className="mt-8 flex gap-5">
            <Link
              href="/problems"
              className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Start Solving</span>
              <span className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-100 transition"></span>
            </Link>

            <Link
              href="/topics"
              className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-indigo-700 hover:scale-105"
            >
              View Roadmap
            </Link>
          </div>
        </div>

        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-400/30 blur-3xl animate-pulse" />
      </motion.section>

      {/* ================= MAIN GRID ================= */}
      <section className="grid gap-10 lg:grid-cols-[1fr_340px]">

        {/* LEFT SIDE */}
        <div className="space-y-10">

          {/* Announcement */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-white/80 dark:bg-[#1a1a1a] backdrop-blur-lg shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300"
          >
            <div className="border-b px-8 py-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Announcement
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                Welcome to Algoryth 🚀
              </h2>
            </div>

            <div className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">
              Start solving problems today and build consistency. Even 2
              problems daily can change your career.
            </div>
          </motion.div>


          {/* Quick Start */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="border-b px-8 py-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-500">
                Quick Start
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Recommended problems
              </div>
            </div>

            <div className="divide-y">
              {[
                { title: "Two Sum", slug: "two-sum", diff: "Easy" },
                { title: "Valid Parentheses", slug: "valid-parentheses", diff: "Easy" },
                { title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
              ].map((p) => (
                <Link
                  key={p.slug}
                  href={`/problems/${p.slug}`}
                  className="flex items-center justify-between px-8 py-5 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-[#222] dark:hover:to-[#2b2b2b] hover:translate-x-1"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                    p.diff === "Easy"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {p.diff}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>


          {/* Learn Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="border-b px-8 py-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                Learn
              </div>
              <h2 className="mt-2 text-xl font-bold">
                Structured Learning Path
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Topic-wise roadmap from beginner to advanced.
              </p>
            </div>

            <div className="px-8 py-6">
              <ul className="mb-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li>✔ Topic-wise modules</li>
                <li>✔ Curated difficulty progression</li>
                <li>✔ Interview preparation focus</li>
              </ul>

              <Link
                href="/topics"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-indigo-700 hover:scale-105"
              >
                Explore Roadmap →
              </Link>
            </div>
          </motion.div>
        </div>


        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="space-y-10">

          {/* Contest Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white shadow-2xl transition"
          >
            <div className="text-xl font-bold">
              Weekly Contest 🔥
            </div>
            <div className="mt-2 text-sm text-white/90">
              Practice Round · Improve your speed
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:bg-gray-100 hover:scale-105"
            >
              Register Soon
            </button>
          </motion.div>


          {/* Profile Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-xl border border-gray-200 dark:border-gray-800 p-8"
          >
            <div className="text-xl font-bold">
              {user ? user.name : "Guest"}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Rating</span>
                <span className="font-bold text-indigo-600">{stats.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Solved</span>
                <span className="font-bold text-green-600">{stats.total}</span>
              </div>
          </div>
          <div className="px-5 py-5 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-[#5d5245] dark:text-[#d7ccbe]">Rating</div>
              <div className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">910</div>
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

            <div className="mt-6 space-y-3 text-sm">
              {["Dashboard", "Bookmarks", "Settings", "Submissions"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block font-medium transition-all duration-300 hover:text-indigo-600 hover:translate-x-1"
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        </aside>
      </section>
    </div>
  );
}