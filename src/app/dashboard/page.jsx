'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardStats from '../../components/DashboardStats';
import BadgeDisplayMini from '../../components/BadgeDisplayMini';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, loading: authLoading, token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('algoryth_token');
        if (!token) {
          // No token, try to load from localStorage as fallback
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          setSubmissions(Array.isArray(parsed) ? parsed : []);
          setLoading(false);
          return;
        }

        // Fetch from server API
        const response = await fetch('/api/submissions/history?limit=20', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
        setStats(data.stats || {});
      } catch (e) {
        console.error('Failed to fetch submissions from server:', e);
        setError('Failed to load submissions');

        // Fallback to localStorage
        try {
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) setSubmissions(parsed);
        } catch (fallbackError) {
          console.error('Fallback to localStorage also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmissions();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !submissions.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Using local data from your browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-7xl space-y-14 pb-24"
    >

      {/* ================= HEADER ================= */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-10 text-white shadow-[0_20px_60px_rgba(99,102,241,0.4)] transition-all duration-300"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome back,{' '}
          <span className="text-white">
            {user?.name || 'Developer'}
          </span>
        </h1>

        <p className="mt-3 text-white/90">
          Track your coding progress and dominate the leaderboard 🚀
        </p>

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
      </motion.div>

      {/* ================= STATS ================= */}
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <DashboardStats submissions={submissions} />
      </motion.div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid gap-10 lg:grid-cols-3">

        {/* ================= RECENT SUBMISSIONS ================= */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="lg:col-span-2 rounded-3xl bg-white/80 dark:bg-[#17171d]/80 backdrop-blur-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
        >
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-[#1f1f27] dark:to-[#252530]">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold">
                Recent Submissions
              </h3>
            </div>

            <Link
              href="/submissions"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition duration-200 hover:scale-105"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {submissions.length > 0 ? (
              submissions.slice(0, 8).map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 10 }}
                  className="flex items-center justify-between px-8 py-5 transition-all hover:bg-indigo-50/60 dark:hover:bg-[#23232d]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                          s.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/40'
                        }`}
                      >
                        {s.status}
                      </span>

                      <h4 className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">
                        {s.problemTitle}
                      </h4>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {s.language} • {new Date(s.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    href={`/problems/${s.problemId?.replace('p-', '') || ''}`}
                    className="ml-4 rounded-full p-2 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-[#2a2a35] transition-all duration-200 hover:scale-110"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="px-8 py-16 text-center text-sm text-gray-500">
                No submissions yet. Start solving problems 🚀
              </div>
            )}
          </div>
        </motion.div>

        {/* ================= SIDEBAR ================= */}
        <div className="space-y-8">

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Recent Badges */}
          {token && (
            <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] p-6 dark:border-[#3c3347] dark:bg-[#211d27]">
              <BadgeDisplayMini token={token} maxBadges={6} showViewAll={true} />
            </div>
          )}

          {/* Quick Links */}
          <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] p-6 dark:border-[#3c3347] dark:bg-[#211d27]">
            <h3 className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0] mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/problems" className="flex items-center gap-2 rounded-xl border border-[#deceb7] bg-white p-3 text-sm font-medium text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]">
                <span>Browse Problems</span>
              </Link>
            </div>
          </div>
        </div>

          {/* Quick Access */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 180 }}
            className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-2xl transition-all duration-300 hover:shadow-[0_25px_70px_rgba(99,102,241,0.4)]"
          >
            <h3 className="text-lg font-bold mb-6">
              Quick Access
            </h3>

            <div className="space-y-4">
              <Link
                href="/problems"
                className="block rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold backdrop-blur-md hover:bg-white/30 transition-all duration-200 hover:scale-[1.03]"
              >
                Browse Problems
              </Link>

              <Link
                href="/contests"
                className="block rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold backdrop-blur-md hover:bg-white/30 transition-all duration-200 hover:scale-[1.03]"
              >
                Upcoming Contests
              </Link>
            </div>
          </motion.div>

          {/* Motivation Card */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="rounded-3xl bg-white dark:bg-[#17171d] shadow-xl border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
          >
            <h3 className="text-lg font-bold mb-3">
              🚀 Daily Goal
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Solve 2 problems today to maintain your streak and improve rating.
            </p>

            <Link
              href="/problems"
              className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 hover:scale-105 hover:shadow-lg"
            >
              Start Solving →
            </Link>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
