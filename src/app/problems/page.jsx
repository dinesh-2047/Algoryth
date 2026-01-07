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
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#deceb7] bg-white px-4 pr-10 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
            />
            {search && (
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
            value={difficulty}
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
            value={sort}
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
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                  selectedTags.includes(tag)
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

      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-white dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 border-b border-[#e0d5c2] bg-[#f7f0e0] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:border-[#3c3347] dark:bg-[#292331] dark:text-[#b5a59c]">
          <div>#</div>
          <div>Title</div>
          <div>Difficulty</div>
          <div>Status</div>
          <div>Tags</div>
        </div>

        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {problems.map((p, i) => (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}

              className="grid grid-cols-[56px_1.2fr_.45fr_.45fr_.9fr] gap-4 px-5 py-3 hover:bg-[#f6e9d2] dark:hover:bg-[#2d2535]"
            >
              <div className="flex items-center text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  {p.title}
                </div>
                <div className="mt-1 text-xs text-[#b5a08a] dark:text-[#b5a59c]">
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
                <span className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#d69a441a] px-2.5 py-1 text-xs text-[#5d5245] dark:border-[#40364f] dark:bg-[#f6ede01a] dark:text-[#d7ccbe]">
                  {p.status || "Not Started"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span
                    key={`${p.id}-${t}`}
                    className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#f2e3cc] px-2.5 py-1 text-xs text-[#5d5245] dark:border-[#40364f] dark:bg-[#2d2535] dark:text-[#d7ccbe]"
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
