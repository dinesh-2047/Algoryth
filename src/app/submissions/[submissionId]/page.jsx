'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock3,
  Code2,
  Copy,
  HardDrive,
  Link2,
} from 'lucide-react';
import Spinner from '../../../components/Spinner';
import { useAuth } from '../../../context/AuthContext';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

function normalizeSubmission(entry, index) {
  const timestamp = entry.submittedAt || entry.timestamp || new Date().toISOString();
  const verdict = entry.verdict || entry.status || 'Error';

  return {
    id: String(entry._id || entry.id || `${timestamp}-${index}`),
    problemSlug: entry.problemSlug || entry.slug || '',
    problemTitle: entry.problemTitle || entry.title || entry.problemId || 'Untitled Problem',
    verdict,
    language: String(entry.language || 'javascript').toLowerCase(),
    timestamp,
    executionTime: Number(entry.executionTime || 0),
    memoryUsage: Number(entry.memoryUsage || 0),
    testsPassed: Number(entry.testsPassed || 0),
    totalTests: Number(entry.totalTests || 0),
    code: String(entry.code || ''),
    errorMessage: String(entry.errorMessage || entry.details || ''),
    failedTestName: entry.failedTestName || entry.failedCase?.name || null,
    failedTestIndex:
      entry.failedTestIndex === null || entry.failedTestIndex === undefined
        ? null
        : Number(entry.failedTestIndex),
  };
}

function getVerdictClasses(verdict) {
  if (verdict === 'Accepted') {
    return 'bg-[#44d07d] text-black dark:bg-[#173924] dark:text-[#d8ffe4]';
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

  return 'bg-[#0f92ff] text-black dark:bg-[#2f4064] dark:text-[#d5e4ff]';
}

export default function SubmissionDetailPage() {
  const { submissionId } = useParams();
  const normalizedSubmissionId = useMemo(
    () => String(submissionId || '').trim(),
    [submissionId]
  );

  const { token, loading: authLoading } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerTheme, setViewerTheme] = useState('vs');
  const [copied, setCopied] = useState(false);

  const monacoLanguage = useMemo(() => {
    const language = String(submission?.language || '').toLowerCase();
    const languageMap = {
      javascript: 'javascript',
      js: 'javascript',
      typescript: 'typescript',
      ts: 'typescript',
      python: 'python',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'cpp',
      cc: 'cpp',
      cxx: 'cpp',
      go: 'go',
      rust: 'rust',
    };

    return languageMap[language] || 'plaintext';
  }, [submission?.language]);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setViewerTheme(isDark ? 'vs-dark' : 'vs');
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (!localStorage.getItem('theme')) {
        updateTheme();
      }
    };

    mediaQuery?.addEventListener?.('change', handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.('change', handleSystemThemeChange);
    };
  }, []);

  const handleCopyCode = async () => {
    if (!submission?.code) return;

    try {
      await navigator.clipboard.writeText(submission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (copyError) {
      console.error('Failed to copy submission code:', copyError);
    }
  };

  useEffect(() => {
    const loadSubmissionDetail = async () => {
      if (!normalizedSubmissionId) {
        setError('Submission ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      // First preference: server record for authenticated users.
      if (token) {
        try {
          const response = await fetch(
            `/api/submissions/${encodeURIComponent(normalizedSubmissionId)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            }
          );

          if (response.ok) {
            const payload = await response.json();
            if (payload?.submission) {
              setSubmission(normalizeSubmission(payload.submission, 0));
              setLoading(false);
              return;
            }
          }
        } catch (serverError) {
          console.error('Failed to fetch submission detail from server:', serverError);
        }
      }

      // Fallback: local submission backup.
      try {
        const raw = localStorage.getItem('algoryth_submissions');
        const parsed = raw ? JSON.parse(raw) : [];
        const normalized = Array.isArray(parsed)
          ? parsed.map((entry, index) => normalizeSubmission(entry, index))
          : [];

        const found = normalized.find(
          (entry) => String(entry.id) === normalizedSubmissionId
        );

        if (found) {
          setSubmission(found);
        } else {
          setError('Submission not found.');
        }
      } catch (localError) {
        console.error('Failed to load submission detail from local backup:', localError);
        setError('Unable to load submission detail.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadSubmissionDetail();
    }
  }, [authLoading, normalizedSubmissionId, token]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="neo-card mx-auto max-w-3xl p-6 text-center sm:p-8">
        <h1 className="text-lg font-black uppercase text-black dark:text-[#eef3ff] sm:text-xl">
          Submission Not Available
        </h1>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          {error || 'This submission could not be loaded.'}
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Link
            href="/profile"
            className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
          >
            Back To Profile
          </Link>
          <Link
            href="/submissions"
            className="rounded-lg bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#151525] dark:text-[#eef3ff]"
          >
            View All Submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#151525] dark:text-[#eef3ff]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <Link
          href="/submissions"
          className="rounded-lg bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#151525] dark:text-[#eef3ff]"
        >
          All Submissions
        </Link>
      </div>

      <div className="neo-card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black uppercase text-black dark:text-[#eef3ff] sm:text-2xl">
              {submission.problemTitle}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-black/70 dark:text-[#d4deff]/80 sm:text-sm">
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase ${getVerdictClasses(submission.verdict)}`}>
                {submission.verdict}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(submission.timestamp).toLocaleString()}
              </span>
              <span>•</span>
              <span className="capitalize">{submission.language}</span>
            </div>
          </div>

          {submission.problemSlug ? (
            <Link
              href={`/problems/${submission.problemSlug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f92ff] px-3 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
            >
              <Link2 className="h-3.5 w-3.5" />
              Open Problem
            </Link>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">Runtime</div>
            <div className="mt-1 inline-flex items-center gap-1 text-sm font-black text-black dark:text-[#eef3ff]">
              <Clock3 className="h-3.5 w-3.5" />
              {submission.executionTime > 0 ? `${submission.executionTime} ms` : 'Recorded'}
            </div>
          </div>

          <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">Memory</div>
            <div className="mt-1 inline-flex items-center gap-1 text-sm font-black text-black dark:text-[#eef3ff]">
              <HardDrive className="h-3.5 w-3.5" />
              {submission.memoryUsage > 0 ? `${submission.memoryUsage} KB` : '—'}
            </div>
          </div>

          <div className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">Tests</div>
            <div className="mt-1 inline-flex items-center gap-1 text-sm font-black text-black dark:text-[#eef3ff]">
              <Code2 className="h-3.5 w-3.5" />
              {submission.testsPassed}/{submission.totalTests}
            </div>
          </div>
        </div>

        {submission.errorMessage ? (
          <div className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {submission.errorMessage}
          </div>
        ) : null}

        {(submission.failedTestName || submission.failedTestIndex !== null) ? (
          <div className="mt-3 rounded-lg border border-black/20 bg-white px-3 py-2 text-xs font-semibold text-black/80 dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#d4deff]/84">
            Failed testcase
            {submission.failedTestIndex !== null ? ` #${submission.failedTestIndex}` : ''}
            {submission.failedTestName ? `: ${submission.failedTestName}` : ''}
          </div>
        ) : null}
      </div>

      <div className="neo-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
            Submitted Code
          </h2>

          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="Copy submitted code"
            title="Copy code"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/20 bg-white text-black transition-colors hover:bg-[#fff4a3] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#eef3ff] dark:hover:bg-[#2f4064]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-3 h-[68vh] min-h-72 overflow-hidden rounded-lg border border-black/15 dark:border-[#7d8fc4]/30">
          <Monaco
            height="100%"
            theme={viewerTheme}
            language={monacoLanguage}
            value={submission.code || '// No code saved for this submission.'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              smoothScrolling: true,
              renderLineHighlight: 'line',
              automaticLayout: true,
              padding: { top: 14, bottom: 14 },
              domReadOnly: true,
            }}
          />
        </div>
      </div>
    </section>
  );
}
