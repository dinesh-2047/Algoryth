'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardStats from '../../components/DashboardStats';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('algoryth_submissions');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setSubmissions(parsed);
    } catch (e) {
      console.error('Failed to load submissions', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d69a44] border-t-transparent dark:border-[#f2c66f]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2b2116] dark:text-[#f6ede0]">
          Welcome back, <span className="text-[#d69a44] dark:text-[#f2c66f]">{user?.name || 'Developer'}</span>!
        </h1>
        <p className="mt-2 text-[#5d5245] dark:text-[#d7ccbe]">
          Track your progress, stats, and recent coding activity.
        </p>
      </div>

      <DashboardStats submissions={submissions} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] overflow-hidden dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-6 py-4 dark:border-[#3c3347] dark:bg-[#292331] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8a7a67] dark:text-[#b5a59c]" />
              <h3 className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Recent Submissions</h3>
            </div>
            <Link href="/submissions" className="text-xs font-medium text-[#d69a44] hover:underline dark:text-[#f2c66f]">
              View all
            </Link>
          </div>
          
          <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
            {submissions.length > 0 ? (
              submissions.slice(0, 8).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-[#f2e3cc]/50 dark:hover:bg-[#2d2535]/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-bold ${
                        s.status === 'Accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                      }`}>
                        {s.status === 'Accepted' ? '✓' : '✗'}
                      </span>
                      <h4 className="text-sm font-medium text-[#2b2116] dark:text-[#f6ede0] truncate">
                        {s.problemTitle}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                      <span className="capitalize">{s.language}</span>
                      <span>•</span>
                      <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/problems/${s.problemId?.replace('p-', '') || ''}`}
                    className="ml-4 p-2 rounded-full hover:bg-[#f2e3cc] dark:hover:bg-[#3c3347] text-[#8a7a67] dark:text-[#b5a59c]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-sm text-[#8a7a67] dark:text-[#b5a59c]">
                No submissions yet. Start solving problems to see your activity!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] p-6 dark:border-[#3c3347] dark:bg-[#211d27]">
            <h3 className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0] mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/problems" className="flex items-center gap-2 rounded-xl border border-[#deceb7] bg-white p-3 text-sm font-medium text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]">
                <span>Browse Problems</span>
              </Link>
              <Link href="/contests" className="flex items-center gap-2 rounded-xl border border-[#deceb7] bg-white p-3 text-sm font-medium text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]">
                <span>Upcoming Contests</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
