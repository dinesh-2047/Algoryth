'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, Download, Filter } from 'lucide-react';
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
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2b2116] dark:text-[#f6ede0]">
            My Submissions
          </h1>
          <p className="mt-2 text-[#5d5245] dark:text-[#d7ccbe]">
            View all your code submissions and track progress
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-[#d69a44] px-4 py-2 text-white hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] p-6 dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-[#d69a44]" />
          <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">Filters</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
              Verdict
            </label>
            <select
              value={filterVerdict}
              onChange={(e) => {
                setFilterVerdict(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
            >
              <option value="">All</option>
              <option value="Accepted">Accepted</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Runtime Error">Runtime Error</option>
              <option value="Compilation Error">Compilation Error</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
              Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => {
                setFilterLanguage(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
            >
              <option value="">All</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
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
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-2">
              Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#deceb7] bg-white px-3 py-2 text-sm dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
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
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submissions List */}
      <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] overflow-hidden dark:border-[#3c3347] dark:bg-[#211d27]">
        {submissions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[#5d5245] dark:text-[#d7ccbe]">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
            {submissions.map((submission, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-[#f2e3cc]/50 dark:hover:bg-[#2d2535]/50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {submission.verdict === 'Accepted' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : submission.verdict?.includes('Error') ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* Submission Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#2b2116] dark:text-[#f6ede0] truncate">
                        {submission.problemTitle || submission.slug}
                      </h4>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        submission.verdict === 'Accepted' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : submission.verdict?.includes('Error')
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {submission.verdict}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                      <span className="capitalize">{submission.language}</span>
                      <span>•</span>
                      <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <Link
                  href={`/problems/${submission.problemSlug}`}
                  className="ml-4 rounded-lg bg-[#d69a44] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
                >
                  View
                </Link>
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
            className="rounded-lg border border-[#deceb7] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-[#40364f] dark:bg-[#211d27]"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchSubmissions(p)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  p === page
                    ? 'bg-[#d69a44] text-white dark:bg-[#f2c66f] dark:text-[#231406]'
                    : 'border border-[#deceb7] bg-white dark:border-[#40364f] dark:bg-[#211d27]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSubmissions(page + 1)}
            disabled={page === totalPages}
            className="rounded-lg border border-[#deceb7] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-[#40364f] dark:bg-[#211d27]"
          >
            Next
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-sm text-[#5d5245] dark:text-[#d7ccbe]">
        Showing {submissions.length} of {total} submissions
      </div>
    </div>
  );
}
