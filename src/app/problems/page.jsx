"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sort, setSort] = useState("title");
  const searchParams = useSearchParams();
  const router = useRouter();

  const { urlSearch, urlDifficulty, urlTags, urlSort } = useMemo(() => {
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sort = searchParams.get('sort') || 'title';
    return { urlSearch: search, urlDifficulty: difficulty, urlTags: tags, urlSort: sort };
  }, [searchParams]);

  const fetchProblems = async (searchQuery, diff, tags, sortBy) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (diff) params.set('difficulty', diff);
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (sortBy && sortBy !== 'title') params.set('sort', sortBy);

    const queryString = params.toString();
    const url = `/api/problems${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    const data = await res.json();
    setProblems(data.items);
  };

  useEffect(() => {
    fetchProblems(urlSearch, urlDifficulty, urlTags, urlSort);
  }, [urlSearch, urlDifficulty, urlTags, urlSort]);

  useEffect(() => {
    setSearch(urlSearch);
    setDifficulty(urlDifficulty);
    setSelectedTags(urlTags);
    setSort(urlSort);
  }, [urlSearch, urlDifficulty, urlTags, urlSort]);

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
    setSearch(value);
    updateURL(value, difficulty, selectedTags, sort);
  };

  const handleDifficulty = (value) => {
    setDifficulty(value);
    updateURL(search, value, selectedTags, sort);
  };

  const handleTag = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateURL(search, difficulty, newTags, sort);
  };

  const handleSort = (value) => {
    setSort(value);
    updateURL(search, difficulty, selectedTags, value);
  };

  const allTags = ["arrays", "hash-map", "stack", "dp"];

  return (
    <section className="flex flex-col gap-6 dark:bg-black">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
            Problems
          </h1>
          <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-300">
            Browse problems. This uses mock data + API routes.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <div className="relative">
            <input
              aria-label="Search problems"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-4 pr-10 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-white/10"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
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
          <label className="text-sm font-medium">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficulty(e.target.value)}
            className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-zinc-950"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort:</label>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-zinc-950"
          >
            <option value="title">Title</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tags:</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTag(tag)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                  selectedTags.includes(tag)
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-black/10 text-zinc-700 dark:border-white/10 dark:text-zinc-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 border-b border-black/10 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-black dark:text-zinc-400">
          <div>#</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Status</div>
          <div>Tags</div>
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
          {problems.map((p, i) => (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}

              className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 px-5 py-3 hover:bg-black/2 dark:hover:bg-white/5"
            >
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-300">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {p.title}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-300">
                  {p.id}
                </div>
              </div>

              <div className="flex items-center">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${difficultyClasses(
                    p.difficulty
                  )}`}
                >
                  {p.difficulty}
                </span>
              </div>

              <div className="flex items-center">
                <span className="inline-flex items-center rounded-full border border-black/10 bg-black/3 px-2.5 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
                  {p.status || "Not Started"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span
                    key={`${p.id}-${t}`}
                    className="inline-flex items-center rounded-full border border-black/10 bg-amber-100 px-2.5 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
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
