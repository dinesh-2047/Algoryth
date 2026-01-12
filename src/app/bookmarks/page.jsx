'use client';

import { useState, useEffect, useMemo } from 'react';
import ProblemCard from '../../components/ProblemCard';

export default function BookmarksPage() {
  const [problems, setProblems] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load bookmarks from localStorage
        const saved = localStorage.getItem('bookmarkedProblems');
        const ids = saved ? JSON.parse(saved) : [];
        setBookmarkedIds(ids);

        // Fetch all problems
        const res = await fetch('/api/problems');
        const data = await res.json();
        setProblems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bookmarkedProblems = useMemo(() => {
    return problems.filter((p) => bookmarkedIds.includes(p.id));
  }, [problems, bookmarkedIds]);

  const handleBookmark = (problemId) => {
    const newBookmarks = bookmarkedIds.filter((id) => id !== problemId);
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('bookmarkedProblems', JSON.stringify(newBookmarks));
  };

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
          Bookmarked Problems
        </h1>
        <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
          Your curated list of problems to solve later
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : bookmarkedProblems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedProblems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={index}
              onBookmark={handleBookmark}
              isBookmarked={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl bg-[#f7f0e0] dark:bg-[#292331]">
          <div className="text-4xl mb-4">🔖</div>
          <h3 className="text-xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
            No Bookmarks Yet
          </h3>
          <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Problems you bookmark will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
