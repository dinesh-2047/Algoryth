'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock3,
  Code2,
  Compass,
  Flame,
  Medal,
  Mail,
  MapPin,
  Settings,
  Target,
  Trophy,
  User,
} from 'lucide-react';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import { useAuth } from '../../context/AuthContext';

function normalizeDifficulty(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'easy') return 'Easy';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'hard') return 'Hard';
  return 'Unknown';
}

function normalizeSubmission(entry, index) {
  const timestamp = entry.submittedAt || entry.timestamp || new Date().toISOString();
  const verdict = entry.verdict || entry.status || 'Error';

  return {
    id: entry._id || entry.id || `${timestamp}-${index}`,
    slug: entry.problemSlug || entry.slug || '',
    problemSlug: entry.problemSlug || entry.slug || '',
    title: entry.problemTitle || entry.title || entry.problemId || 'Untitled Problem',
    verdict,
    language: String(entry.language || 'javascript').toLowerCase(),
    timestamp,
    difficulty: normalizeDifficulty(entry.difficulty),
    executionTime: Number(entry.executionTime || 0),
    memoryUsage: Number(entry.memoryUsage || 0),
    code: String(entry.code || ''),
    errorMessage: String(entry.errorMessage || entry.details || ''),
  };
}

function getVerdictStyles(verdict) {
  if (verdict === 'Accepted') {
    return 'bg-[#44d07d] text-black dark:bg-[#1f3a34] dark:text-[#d8ffe4]';
  }

  if (
    verdict === 'Wrong Answer' ||
    verdict === 'Runtime Error' ||
    verdict === 'Compilation Error' ||
    verdict === 'Time Limit Exceeded' ||
    verdict === 'Memory Limit Exceeded' ||
    verdict === 'Output Limit Exceeded'
  ) {
    return 'bg-[#ff6b35] text-black dark:bg-[#4d2a25] dark:text-[#ffe2d8]';
  }

  return 'bg-[#0f92ff] text-black dark:bg-[#2f2b5a] dark:text-[#d5e4ff]';
}

function getDifficultyBarClasses(difficulty) {
  if (difficulty === 'Easy') {
    return {
      label: 'text-[#1c6b3a] dark:text-[#8ff0b8]',
      fill: 'bg-[#44d07d] dark:bg-[#2f8f59]',
    };
  }

  if (difficulty === 'Medium') {
    return {
      label: 'text-[#0d5fa5] dark:text-[#8edbff]',
      fill: 'bg-[#0f92ff] dark:bg-[#3a86db]',
    };
  }

  return {
    label: 'text-[#a2481a] dark:text-[#ffc8b2]',
    fill: 'bg-[#ff6b35] dark:bg-[#9a4a44]',
  };
}

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        if (!token) {
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          const localSubmissions = Array.isArray(parsed)
            ? parsed.map((entry, index) => normalizeSubmission(entry, index))
            : [];

          localSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setSubmissions(localSubmissions);
          return;
        }

        const response = await fetch('/api/submissions/history?limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch submissions (${response.status})`);
        }

        const data = await response.json();
        const normalized = Array.isArray(data.submissions)
          ? data.submissions.map((entry, index) => normalizeSubmission(entry, index))
          : [];

        normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSubmissions(normalized);
      } catch (error) {
        console.error('Failed to load profile submissions:', error);

        try {
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          const fallbackSubmissions = Array.isArray(parsed)
            ? parsed.map((entry, index) => normalizeSubmission(entry, index))
            : [];

          fallbackSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setSubmissions(fallbackSubmissions);
        } catch (fallbackError) {
          console.error('Fallback submissions load failed:', fallbackError);
          setSubmissions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmissions();
    }
  }, [authLoading, token]);

  const profileStats = useMemo(() => {
    const acceptedSubmissions = submissions.filter((submission) => submission.verdict === 'Accepted');

    const solvedByProblem = new Map();
    acceptedSubmissions.forEach((submission) => {
      const problemKey = submission.slug || submission.title;
      if (!problemKey || solvedByProblem.has(problemKey)) return;
      solvedByProblem.set(problemKey, submission.difficulty);
    });

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    solvedByProblem.forEach((difficulty) => {
      if (difficulty === 'Easy') easySolved += 1;
      if (difficulty === 'Medium') mediumSolved += 1;
      if (difficulty === 'Hard') hardSolved += 1;
    });

    const languageCounts = submissions.reduce((accumulator, submission) => {
      const language = submission.language || 'unknown';
      accumulator[language] = (accumulator[language] || 0) + 1;
      return accumulator;
    }, {});

    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalSubmissions = submissions.length;
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
      : 0;

    return {
      solvedTotal: solvedByProblem.size,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions,
      acceptedSubmissions: acceptedSubmissions.length,
      acceptanceRate,
      topLanguages,
      recentSubmissions: submissions.slice(0, 12),
    };
  }, [submissions]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0f92ff] border-t-transparent dark:border-[#56d5ff] dark:border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="neo-card mx-auto flex max-w-xl flex-col items-center p-10 text-center">
        <User className="h-12 w-12 text-black/60 dark:text-[#9ab0e6]" />
        <h2 className="mt-4 text-2xl font-black uppercase text-black dark:text-[#edf2ff]">
          Login Required
        </h2>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d8e2ff]/82">
          Sign in to view your LeetCode-style profile dashboard.
        </p>
        <Link
          href="/auth"
          className="mt-5 rounded-xl bg-[#0f92ff] px-5 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#63f3b6] dark:text-[#07150f]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const username = user.username || user.email?.split('@')[0] || 'coder';
  const joinedLabel = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Recently';

  const solvedTotal = profileStats.solvedTotal || 1;
  const solvedBars = [
    { label: 'Easy', value: profileStats.easySolved },
    { label: 'Medium', value: profileStats.mediumSolved },
    { label: 'Hard', value: profileStats.hardSolved },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl min-w-0 space-y-4 overflow-x-hidden sm:space-y-6">
      <header className="neo-card relative w-full min-w-0 overflow-hidden px-4 py-5 sm:px-6 sm:py-8 md:px-8">
        <div className="absolute -right-8 -top-8 h-20 w-20 rotate-12 border-2 border-black bg-[#0f92ff] dark:border-[#7d8fc4] dark:bg-[#2f2b5a] sm:-right-10 sm:-top-10 sm:h-28 sm:w-28" />
        <div className="absolute -bottom-9 left-7 h-16 w-16 rounded-full border-2 border-black bg-[#44d07d] dark:border-[#7d8fc4] dark:bg-[#1f3a34] sm:-bottom-12 sm:left-10 sm:h-24 sm:w-24" />

        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white text-xl font-black text-black dark:border-[#7d8fc4] dark:bg-[#10182d] dark:text-[#edf2ff] sm:h-16 sm:w-16 sm:text-2xl">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-3xl">
              {user.name || 'Developer'}
            </h1>
            <p className="truncate text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/82 sm:text-sm">@{username}</p>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="min-w-0 space-y-3 sm:space-y-4">
          <div className="neo-card w-full min-w-0 p-4 sm:p-5">
            <h2 className="text-[11px] font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
              Profile
            </h2>

            <div className="mt-3 space-y-2.5 text-xs font-semibold text-black/80 dark:text-[#d8e2ff]/84 sm:mt-4 sm:space-y-3 sm:text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="min-w-0 break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Joined {joinedLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{user.location || 'Earth'}</span>
              </div>
            </div>

            <p className="mt-3 wrap-break-word text-xs font-medium text-black/75 dark:text-[#d8e2ff]/82 sm:mt-4 sm:text-sm">
              {user.bio || 'Focused on daily DSA drills, clean implementations, and consistent rating growth.'}
            </p>
          </div>

          <div className="neo-card w-full min-w-0 p-4 sm:p-5">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
              Quick Numbers
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3">
              <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] sm:p-3">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8] sm:text-xs">Rating</div>
                <div className="mt-1 text-lg font-black text-black dark:text-[#edf2ff] sm:text-xl">
                  {user.rating || 1200}
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] sm:p-3">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8] sm:text-xs">Streak</div>
                <div className="mt-1 flex items-center gap-1 text-lg font-black text-black dark:text-[#edf2ff] sm:text-xl">
                  {user.streakCount || user.streak || 0}
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] sm:p-3">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8] sm:text-xs">Attempts</div>
                <div className="mt-1 text-lg font-black text-black dark:text-[#edf2ff] sm:text-xl">
                  {profileStats.totalSubmissions}
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] sm:p-3">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8] sm:text-xs">Accepted</div>
                <div className="mt-1 text-lg font-black text-black dark:text-[#edf2ff] sm:text-xl">
                  {profileStats.acceptedSubmissions}
                </div>
              </div>
            </div>
          </div>

          <div className="neo-card w-full min-w-0 p-4 sm:p-5">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
              Top Languages
            </h3>
            {profileStats.topLanguages.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {profileStats.topLanguages.map(([language, count]) => (
                  <span
                    key={language}
                    className="rounded-full border border-black/30 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] sm:px-3 sm:text-xs"
                  >
                    {language} ({count})
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/76 sm:text-sm">
                No language data yet.
              </p>
            )}
          </div>

          <div className="neo-card w-full min-w-0 p-4 sm:p-5">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
              Profile Menu
            </h3>
            <div className="mt-3 grid gap-2">
              <Link
                href="/badges"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b] sm:text-xs"
              >
                <Medal className="h-3.5 w-3.5" />
                Achievements
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b] sm:text-xs"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
              <Link
                href="/contests"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b] sm:text-xs"
              >
                <Compass className="h-3.5 w-3.5" />
                Contests
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div className="neo-card w-full min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black uppercase text-black dark:text-[#edf2ff] sm:text-lg">
                  Solved Problems
                </h2>
                <p className="mt-1 text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/76 sm:text-sm">
                  LeetCode-style difficulty split based on accepted submissions.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0f92ff] px-3 py-1 text-xs font-black uppercase text-black dark:bg-[#56d5ff] sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {profileStats.solvedTotal} solved
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              {solvedBars.map((bar) => {
                const style = getDifficultyBarClasses(bar.label);
                const width = Math.round((bar.value / solvedTotal) * 100);

                return (
                  <div key={bar.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`text-xs font-black uppercase sm:text-sm ${style.label}`}>{bar.label}</span>
                      <span className="text-xs font-black text-black dark:text-[#edf2ff] sm:text-sm">{bar.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full border border-black/20 bg-white dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                      <div
                        className={`h-full ${style.fill}`}
                        style={{ width: `${Math.max(width, bar.value > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-black/70 dark:text-[#d8e2ff]/76 sm:gap-4 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                Acceptance: {profileStats.acceptanceRate}%
              </span>
              <span className="inline-flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5" />
                Attempts: {profileStats.totalSubmissions}
              </span>
            </div>
          </div>

          <ActivityHeatmap token={token} />

          <div className="neo-card w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/20 bg-white px-4 py-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] sm:px-5 sm:py-3">
              <h3 className="text-[11px] font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
                Recent Submissions
              </h3>
              <Link
                href="/submissions"
                className="text-[10px] font-black uppercase tracking-wide text-black underline dark:text-[#8edbff] sm:text-xs"
              >
                View All
              </Link>
            </div>

            {profileStats.recentSubmissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-semibold text-black/70 dark:text-[#d8e2ff]/76">
                  No submissions yet. Start solving to populate your profile timeline.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/10 dark:divide-[#7d8fc4]/25">
                {profileStats.recentSubmissions.map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/submissions/${encodeURIComponent(String(submission.id))}`}
                    className="group block border-b border-black/5 px-4 py-3.5 transition-colors last:border-0 hover:bg-[#fff4a3] dark:border-[#7d8fc4]/15 dark:hover:bg-[#25304a] sm:px-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-black uppercase tracking-wide text-black dark:text-[#edf2ff] sm:text-sm">
                        {submission.title || submission.problemTitle || submission.problemSlug || 'Untitled Problem'}
                      </span>
                      <span className="inline-flex shrink-0 items-center justify-center rounded bg-black/5 p-1.5 text-black/40 transition-colors group-hover:bg-black group-hover:text-[#fef08a] dark:bg-[#7d8fc4]/10 dark:text-[#d8e2ff]/40 dark:group-hover:bg-[#eef3ff] dark:group-hover:text-[#10182d]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


