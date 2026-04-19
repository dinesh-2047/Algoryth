'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
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
  XCircle,
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
    title: entry.problemTitle || entry.title || entry.problemId || 'Untitled Problem',
    verdict,
    language: String(entry.language || 'javascript').toLowerCase(),
    timestamp,
    difficulty: normalizeDifficulty(entry.difficulty),
    executionTime: Number(entry.executionTime || 0),
    memoryUsage: Number(entry.memoryUsage || 0),
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
    <section className="space-y-6">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="absolute -right-10 -top-10 h-28 w-28 rotate-12 border-2 border-black bg-[#0f92ff] dark:border-[#7d8fc4] dark:bg-[#2f2b5a]" />
        <div className="absolute -bottom-12 left-10 h-24 w-24 rounded-full border-2 border-black bg-[#44d07d] dark:border-[#7d8fc4] dark:bg-[#1f3a34]" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-black bg-white text-2xl font-black text-black dark:border-[#7d8fc4] dark:bg-[#10182d] dark:text-[#edf2ff]">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
              {user.name || 'Developer'}
            </h1>
            <p className="text-sm font-semibold text-black/70 dark:text-[#d8e2ff]/82">@{username}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="neo-card p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
              Profile
            </h2>

            <div className="mt-4 space-y-3 text-sm font-semibold text-black/80 dark:text-[#d8e2ff]/84">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{user.location || 'Earth'}</span>
              </div>
            </div>

            <p className="mt-4 text-sm font-medium text-black/75 dark:text-[#d8e2ff]/82">
              {user.bio || 'Focused on daily DSA drills, clean implementations, and consistent rating growth.'}
            </p>
          </div>

          <div className="neo-card p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
              Quick Numbers
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                <div className="text-xs font-black uppercase text-black/60 dark:text-[#9baed8]">Rating</div>
                <div className="mt-1 text-xl font-black text-black dark:text-[#edf2ff]">
                  {user.rating || 1200}
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                <div className="text-xs font-black uppercase text-black/60 dark:text-[#9baed8]">Streak</div>
                <div className="mt-1 flex items-center gap-1 text-xl font-black text-black dark:text-[#edf2ff]">
                  {user.streakCount || user.streak || 0}
                  <Flame className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                <div className="text-xs font-black uppercase text-black/60 dark:text-[#9baed8]">Attempts</div>
                <div className="mt-1 text-xl font-black text-black dark:text-[#edf2ff]">
                  {profileStats.totalSubmissions}
                </div>
              </div>

              <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                <div className="text-xs font-black uppercase text-black/60 dark:text-[#9baed8]">Accepted</div>
                <div className="mt-1 text-xl font-black text-black dark:text-[#edf2ff]">
                  {profileStats.acceptedSubmissions}
                </div>
              </div>
            </div>
          </div>

          <div className="neo-card p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
              Top Languages
            </h3>
            {profileStats.topLanguages.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {profileStats.topLanguages.map(([language, count]) => (
                  <span
                    key={language}
                    className="rounded-full border border-black/30 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff]"
                  >
                    {language} ({count})
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-black/70 dark:text-[#d8e2ff]/76">
                No language data yet.
              </p>
            )}
          </div>

          <div className="neo-card p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
              Profile Menu
            </h3>
            <div className="mt-3 grid gap-2">
              <Link
                href="/badges"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b]"
              >
                <Medal className="h-3.5 w-3.5" />
                Achievements
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b]"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
              <Link
                href="/contests"
                className="inline-flex items-center gap-2 rounded-lg border border-black/30 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black transition-colors hover:bg-[#44d07d] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#edf2ff] dark:hover:bg-[#2b406b]"
              >
                <Compass className="h-3.5 w-3.5" />
                Contests
              </Link>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="neo-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase text-black dark:text-[#edf2ff]">
                  Solved Problems
                </h2>
                <p className="mt-1 text-sm font-semibold text-black/70 dark:text-[#d8e2ff]/76">
                  LeetCode-style difficulty split based on accepted submissions.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-[#0f92ff] px-4 py-1.5 text-sm font-black uppercase text-black dark:bg-[#56d5ff]">
                <Trophy className="h-4 w-4" />
                {profileStats.solvedTotal} solved
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {solvedBars.map((bar) => {
                const style = getDifficultyBarClasses(bar.label);
                const width = Math.round((bar.value / solvedTotal) * 100);

                return (
                  <div key={bar.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`text-sm font-black uppercase ${style.label}`}>{bar.label}</span>
                      <span className="text-sm font-black text-black dark:text-[#edf2ff]">{bar.value}</span>
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

            <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/76">
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

          <div className="neo-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/20 bg-white px-5 py-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
              <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#edf2ff]">
                Recent Submissions
              </h3>
              <Link
                href="/submissions"
                className="text-xs font-black uppercase tracking-wide text-black underline dark:text-[#8edbff]"
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
                  <div key={submission.id} className="grid gap-3 px-5 py-3 md:grid-cols-[minmax(0,2fr)_130px_120px_150px] md:items-center">
                    <div className="min-w-0">
                      {submission.slug ? (
                        <Link
                          href={`/problems/${submission.slug}`}
                          className="truncate text-sm font-black uppercase text-black hover:underline dark:text-[#edf2ff]"
                        >
                          {submission.title}
                        </Link>
                      ) : (
                        <div className="truncate text-sm font-black uppercase text-black dark:text-[#edf2ff]">
                          {submission.title}
                        </div>
                      )}

                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-black/65 dark:text-[#d8e2ff]/76">
                        <span>{new Date(submission.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{submission.language}</span>
                      </div>
                    </div>

                    <div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-black uppercase ${getVerdictStyles(submission.verdict)}`}>
                        {submission.verdict}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/76">
                      {submission.executionTime > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {submission.executionTime} ms
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {submission.verdict === 'Accepted' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Recorded
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-black/70 dark:text-[#d8e2ff]/76">
                      {submission.memoryUsage > 0 ? `${submission.memoryUsage} KB` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


