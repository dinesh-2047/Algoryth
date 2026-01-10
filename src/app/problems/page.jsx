"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProblemCard from "@/components/ProblemCard";

function difficultyClasses(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "Medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "Hard":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    default:
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
  }
}

function ProblemsPageContent() {
  // const [problems, setProblems] = useState([]); // problems state IS needed for fetch result
  const [problems, setProblems] = useState([]);
  // Removed redundant local state that mirrors URL params

  const searchParams = useSearchParams();
  const router = useRouter();

  const { urlSearch, urlDifficulty, urlTags, urlSort } = useMemo(() => {
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sort = searchParams.get('sort') || 'title';
    return { urlSearch: search, urlDifficulty: difficulty, urlTags: tags, urlSort: sort };
  }, [searchParams]);

  useEffect(() => {
    const fetchProblems = async () => {
      const params = new URLSearchParams();
      if (urlSearch) params.set('search', urlSearch);
      if (urlDifficulty) params.set('difficulty', urlDifficulty);
      if (urlTags.length > 0) params.set('tags', urlTags.join(','));
      if (urlSort && urlSort !== 'title') params.set('sort', urlSort);

      const queryString = params.toString();
      const url = `/api/problems${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      const data = await res.json();
      setProblems(data.items);
    };

    fetchProblems();
  }, [urlSearch, urlDifficulty, urlTags, urlSort]);

  // Removed redundant useEffect that synced URL to local state

  const updateURL = (newSearch, newDifficulty, newTags, newSort) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newDifficulty) params.set('difficulty', newDifficulty);
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    if (newSort && newSort !== 'title') params.set('sort', newSort); // Only include sort if not default

    const queryString = params.toString();
    router.push(`/problems${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleSearch = (value) => {
    updateURL(value, urlDifficulty, urlTags, urlSort);
  };

  const handleDifficulty = (value) => {
    updateURL(urlSearch, value, urlTags, urlSort);
  };

  const handleTag = (tag) => {
    const newTags = urlTags.includes(tag)
      ? urlTags.filter(t => t !== tag)
      : [...urlTags, tag];
    updateURL(urlSearch, urlDifficulty, newTags, urlSort);
  };

  const handleSort = (value) => {
    updateURL(urlSearch, urlDifficulty, urlTags, value);
  };

  const allTags = ["arrays", "hash-map", "stack", "dp"];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
            Problems
          </h1>
          <p className="mt-1 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Browse problems. This uses mock data + API routes.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              aria-label="Search problems"
              placeholder="Search problems..."
              value={urlSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#deceb7] bg-white px-4 pr-10 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
            />
            {urlSearch && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5a08a] hover:text-[#6f6251] dark:text-[#7f748a] dark:hover:text-[#d7ccbe]"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">Difficulty:</label>
          <select
            value={urlDifficulty}
            onChange={(e) => handleDifficulty(e.target.value)}
            className="h-9 rounded-lg border border-[#deceb7] bg-white px-3 text-sm text-[#2b2116] outline-none dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">Sort:</label>
          <select
            value={urlSort}
            onChange={(e) => handleSort(e.target.value)}
            className="h-9 rounded-lg border border-[#deceb7] bg-white px-3 text-sm text-[#2b2116] outline-none dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
          >
            <option value="title">Title</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">Tags:</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTag(tag)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${urlTags.includes(tag)
                  ? "bg-[#d69a44] text-[#2b1a09] dark:bg-[#f2c66f] dark:text-[#231406]"
                  : "border border-[#deceb7] text-[#5d5245] dark:border-[#40364f] dark:text-[#d7ccbe]"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {problems.length > 0 ? (
          problems.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} />)
        ) : (
          <div className="col-span-full rounded-xl border border-[#e0d5c2] bg-white p-12 text-center dark:border-[#3c3347] dark:bg-[#211d27]">
            <svg
              className="mx-auto h-12 w-12 text-[#b5a08a] dark:text-[#7f748a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-[#2b2116] dark:text-[#f6ede0]">
              No problems found
            </h3>
            <p className="mt-2 text-sm text-[#8a7a67] dark:text-[#b5a59c]">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>

    </section>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProblemsPageContent />
    </Suspense>
  );
}
