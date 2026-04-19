'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowRight, Flame, Trophy, BookOpen, Target } from 'lucide-react';

export default function Home() {
  const { user, token } = useAuth();
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadStats = async () => {
      try {
        const includePrivate = user?.role === 'admin';
        const problemResponse = await fetch(
          `/api/problems?sort=rating${includePrivate ? '&includePrivate=true' : ''}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
            cache: 'no-store',
          }
        );

        if (problemResponse.ok) {
          const problemPayload = await problemResponse.json();
          if (!isCancelled) {
            setTotalProblems(Array.isArray(problemPayload.items) ? problemPayload.items.length : 0);
          }
        }
      } catch (error) {
        console.error('Failed to load problem counts:', error);
      }

      if (token) {
        try {
          const submissionResponse = await fetch('/api/submissions/history?limit=1', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          });

          if (submissionResponse.ok) {
            const submissionPayload = await submissionResponse.json();
            const solvedCount = Number(submissionPayload?.stats?.uniqueProblems || 0);
            if (!isCancelled) {
              setTotalSolved(solvedCount);
            }
            return;
          }
        } catch (error) {
          console.error('Failed to load submission stats:', error);
        }
      }

      try {
        const raw = localStorage.getItem('algoryth_submissions');
        const parsed = raw ? JSON.parse(raw) : [];
        const accepted = Array.isArray(parsed)
          ? parsed.filter((submission) => (submission.status || submission.verdict) === 'Accepted')
          : [];

        const uniqueSolved = new Set(
          accepted.map((submission) => submission.problemSlug || submission.slug || submission.problemId)
        );

        if (!isCancelled) {
          setTotalSolved(uniqueSolved.size);
        }
      } catch (error) {
        console.error('Failed to load local solved stats:', error);
      }
    };

    loadStats();

    return () => {
      isCancelled = true;
    };
  }, [token, user?.role]);

  const solvedPercent = totalProblems > 0
    ? Math.min(Math.round((totalSolved / totalProblems) * 100), 100)
    : 0;

  const currentStreak = Number(user?.streakCount || 0);
  const currentRating = Number(user?.rating || 0);

  const quickStats = [
    {
      label: 'Solved',
      value: totalSolved,
      icon: Target,
      color: 'bg-[#44d07d] dark:bg-[#173924]'
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
      icon: Flame,
      color: 'bg-[#ff6b35] dark:bg-[#3c1e17]'
    },
    {
      label: 'Progress',
      value: `${solvedPercent}%`,
      icon: Trophy,
      color: 'bg-[#0f92ff] dark:bg-[#152c45]'
    },
  ];

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-6">
        <div className="neo-card relative overflow-hidden bg-[#fff9d0] p-8 dark:bg-[#202037]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rotate-12 border-4 border-black bg-[#ff6b35] dark:border-[#fef08a] dark:bg-[#263f5a]" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#44d07d] px-4 py-1 text-xs font-black uppercase tracking-widest text-black dark:border-[#fef08a] dark:bg-[#173924] dark:text-[#fef08a]">
              <span>Algoryth</span>
            </div>
            <h1 className="mt-4 text-4xl font-black uppercase leading-tight text-black dark:text-[#fff9f0] sm:text-5xl">
              Build Real Contest-Level DSA Skills.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold text-black/80 dark:text-[#fff9f0]/85 sm:text-base">
              Practice production-style problems with hidden test suites, fast execution feedback,
              and verdict analytics that help you improve every submission.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/problems"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f92ff] px-5 py-3 text-sm font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
              >
                Start Solving
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-black dark:bg-[#151525] dark:text-[#fff9f0]"
              >
                Explore Roadmap
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`neo-card p-4 ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black dark:text-[#fff9f0]">
                    {stat.label}
                  </span>
                  <Icon className="h-4 w-4 text-black dark:text-[#fff9f0]" />
                </div>
                <div className="mt-3 text-2xl font-black text-black dark:text-[#fff9f0]">{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="neo-card bg-[#fff9d0] p-6 dark:bg-[#202037]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black uppercase text-black dark:text-[#fff9f0]">
              Recommended Problems
            </h2>
            <Flame className="h-5 w-5 text-black dark:text-[#fef08a]" />
          </div>

          <div className="mt-4 grid gap-3">
            {[
              { title: 'Two Sum', slug: 'two-sum', diff: 'Easy', badge: 'bg-[#44d07d]' },
              { title: 'Valid Parentheses', slug: 'valid-parentheses', diff: 'Easy', badge: 'bg-[#44d07d]' },
              { title: 'Maximum Subarray', slug: 'max-subarray', diff: 'Medium', badge: 'bg-[#0f92ff]' },
            ].map((problem) => (
              <Link
                key={problem.slug}
                href={`/problems/${problem.slug}`}
                className="flex items-center justify-between rounded-xl border-[3px] border-black bg-white px-4 py-3 font-bold text-black dark:border-[#fef08a] dark:bg-[#151525] dark:text-[#fff9f0]"
              >
                <span>{problem.title}</span>
                <span className={`rounded-full border-2 border-black px-2 py-1 text-xs uppercase ${problem.badge}`}>
                  {problem.diff}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <aside className="grid gap-6">
        <div className="neo-card bg-[#fff9d0] p-6 dark:bg-[#202037]">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-black dark:text-[#fff9f0]">
            <Trophy className="h-4 w-4" />
            Weekly Contest
          </div>
          <p className="mt-3 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/85">
            Algoryth Round starts in 02:14:09. Join to benchmark your rating climb.
          </p>
          <button className="mt-4 w-full rounded-xl bg-[#ff6b35] py-2 text-sm font-black uppercase text-black dark:bg-[#fef08a]">
            Register
          </button>
        </div>

        <div className="neo-card bg-[#fff9d0] p-6 dark:bg-[#202037]">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-black dark:text-[#fff9f0]">
            <BookOpen className="h-4 w-4" />
            Focus Path
          </div>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/85">
            <li>1. Arrays + Hashing fundamentals</li>
            <li>2. Sliding window + stack speed drills</li>
            <li>3. Graph traversal stress set</li>
          </ul>
          <Link href="/topics" className="neo-link mt-4 inline-block text-sm text-black dark:text-[#fef08a]">
            Open roadmap
          </Link>
        </div>

        <div className="neo-card bg-[#fff9d0] p-6 dark:bg-[#202037]">
          <div className="text-sm font-black uppercase text-black dark:text-[#fff9f0]">
            {user ? user.name : 'Guest'}
          </div>
          <div className="mt-4 space-y-2 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/85">
            <div className="flex justify-between">
              <span>Rating</span>
                <span>{currentRating || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Solved</span>
              <span>{totalSolved}</span>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-full border-2 border-black bg-white dark:border-[#fef08a] dark:bg-[#151525]">
            <div
              className="h-3 bg-[#0f92ff] transition-all duration-300 dark:bg-[#fef08a]"
              style={{ width: `${solvedPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold uppercase text-black/70 dark:text-[#fff9f0]/75">
            Progress: {solvedPercent}%
          </p>
        </div>
      </aside>
    </section>
  );
}
