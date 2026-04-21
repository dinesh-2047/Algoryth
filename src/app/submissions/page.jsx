'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, Download, Filter, Eye } from 'lucide-react';
import Spinner from '../../components/Spinner';

export default function SubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filterVerdict, setFilterVerdict] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterProblem, setFilterProblem] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch submissions
  const fetchSubmissions = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('algoryth_token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pageNum,
        limit,
        ...(filterVerdict && { verdict: filterVerdict }),
        ...(filterLanguage && { language: filterLanguage }),
        ...(filterProblem && { problemSlug: filterProblem }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/submissions/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      setPage(pageNum);
    } catch (e) {
      console.error('Error fetching submissions:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubmissions(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleFilterChange = () => {
    setPage(1);
    fetchSubmissions(1);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submissions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || (loading && page === 1)) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
            My Submissions
          </h1>
          <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
            View all your code submissions and track progress
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black hover:bg-[#077ad8] dark:bg-[#fef08a] dark:hover:bg-[#e9db63]"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="neo-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-black dark:text-[#d4deff]" />
          <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Filters</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              Verdict
            </label>
            <select
              value={filterVerdict}
              onChange={(e) => {
                setFilterVerdict(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            >
              <option value="">All</option>
              <option value="Accepted">Accepted</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Runtime Error">Runtime Error</option>
              <option value="Compilation Error">Compilation Error</option>
              <option value="Time Limit Exceeded">Time Limit Exceeded</option>
              <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
              <option value="Output Limit Exceeded">Output Limit Exceeded</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => {
                setFilterLanguage(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            >
              <option value="">All</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              Problem
            </label>
            <input
              type="text"
              value={filterProblem}
              onChange={(e) => {
                setFilterProblem(e.target.value);
                handleFilterChange();
              }}
              placeholder="Problem slug..."
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-black dark:text-[#d4deff]">
              Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black dark:bg-[#151525] dark:text-[#eef3ff]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border-2 border-red-500 bg-red-100 p-4 text-red-800 dark:border-red-400 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Submissions List */}
      <div className="neo-card overflow-hidden">
        {submissions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-black/75 dark:text-[#d4deff]/80">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black dark:divide-[#a9b9db]">
            {submissions.map((submission, idx) => (
              <div key={submission._id || idx} className="px-6 py-4 transition-colors hover:bg-[#fff4a3] dark:hover:bg-[#25304a]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {submission.verdict === 'Accepted' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : submission.verdict?.includes('Error') || submission.verdict?.includes('Exceeded') ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    {/* Submission Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-black uppercase text-black dark:text-[#eef3ff]">
                          {submission.problemTitle || submission.slug}
                        </h4>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          submission.verdict === 'Accepted'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : submission.verdict?.includes('Error') || submission.verdict?.includes('Exceeded')
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {submission.verdict}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-black/65 dark:text-[#d4deff]/70">
                        <span className="capitalize">{submission.language}</span>
                        <span>•</span>
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="mt-1 text-xs text-black/75 dark:text-[#d4deff]/80">
                        Passed {submission.testsPassed || 0}/{submission.totalTests || 0} tests
                        {submission.executionTime ? ` • ${submission.executionTime} ms` : ''}
                        {submission.memoryUsage ? ` • ${submission.memoryUsage} KB` : ''}
                      </div>

                      {submission.failedTestName && (
                        <div className="mt-1 text-xs font-semibold text-black dark:text-[#eef3ff]">
                          Failed testcase{submission.failedTestIndex ? ` #${submission.failedTestIndex}` : ''}: {submission.failedTestName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center">
                    <Link
                      href={`/submissions/${encodeURIComponent(String(submission._id || submission.id || idx))}`}
                      aria-label="View submission details"
                      title="View submission"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black transition-colors hover:bg-[#44d07d] dark:bg-[#151525] dark:text-[#eef3ff] dark:hover:bg-[#2d3f62]"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => fetchSubmissions(page - 1)}
            disabled={page === 1}
            className="rounded-lg bg-white px-4 py-2 text-sm font-black uppercase disabled:opacity-50 dark:bg-[#151525] dark:text-[#eef3ff]"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchSubmissions(p)}
                className={`rounded-lg px-3 py-2 text-sm font-black uppercase ${
                  p === page
                    ? 'bg-[#0f92ff] text-black dark:bg-[#fef08a]'
                    : 'bg-white text-black dark:bg-[#151525] dark:text-[#eef3ff]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSubmissions(page + 1)}
            disabled={page === totalPages}
            className="rounded-lg bg-white px-4 py-2 text-sm font-black uppercase disabled:opacity-50 dark:bg-[#151525] dark:text-[#eef3ff]"
          >
            Next
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
        Showing {submissions.length} of {total} submissions
      </div>
    </div>
  );
}
