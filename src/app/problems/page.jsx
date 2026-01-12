"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProblemCard from "../../components/ProblemCard";

function ProblemsPageContent() {
  const [problems, setProblems] = useState([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { urlSearch, urlDifficulty, urlTags, urlSort } = useMemo(() => {
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const sort = searchParams.get("sort") || "title";
    return {
      urlSearch: search,
      urlDifficulty: difficulty,
      urlTags: tags,
      urlSort: sort,
    };
  }, [searchParams]);

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (urlSearch) params.set("search", urlSearch);
        if (urlDifficulty) params.set("difficulty", urlDifficulty);
        if (urlTags.length > 0) params.set("tags", urlTags.join(","));
        if (urlSort && urlSort !== "title") params.set("sort", urlSort);

        const queryString = params.toString();
        const url = `/api/problems${queryString ? `?${queryString}` : ""}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        setProblems(data.items || []);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
        setProblems([]); // Fallback to empty list so we don't crash
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [urlSearch, urlDifficulty, urlTags, urlSort]);

  // Load bookmarked problems from localStorage (runs once on mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookmarkedProblems");
      if (saved) {
        try {
          setBookmarkedProblems(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to parse bookmarks:", error);
        }
      }
    }
  }, []);

  const updateURL = (newSearch, newDifficulty, newTags, newSort) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newDifficulty) params.set("difficulty", newDifficulty);
    if (newTags.length > 0) params.set("tags", newTags.join(","));
    if (newSort && newSort !== "title") params.set("sort", newSort);

    const queryString = params.toString();
    router.push(`/problems${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleSearch = (value) => {
    updateURL(value, urlDifficulty, urlTags, urlSort);
  };

  const handleDifficulty = (value) => {
    updateURL(urlSearch, value, urlTags, urlSort);
  };

  const handleTag = (tag) => {
    const newTags = urlTags.includes(tag)
      ? urlTags.filter((t) => t !== tag)
      : [...urlTags, tag];
    updateURL(urlSearch, urlDifficulty, newTags, urlSort);
  };

  const handleSort = (value) => {
    updateURL(urlSearch, urlDifficulty, urlTags, value);
  };

  const handleBookmark = (problemId) => {
    const newBookmarks = bookmarkedProblems.includes(problemId)
      ? bookmarkedProblems.filter((id) => id !== problemId)
      : [...bookmarkedProblems, problemId];

    setBookmarkedProblems(newBookmarks);
    if (typeof window !== "undefined") {
      localStorage.setItem("bookmarkedProblems", JSON.stringify(newBookmarks));
    }
  };

  const allTags = [
    "daily",
    "arrays",
    "hash-map",
    "stack",
    "dp",
    "sliding-window",
    "binary-search",
    "graphs",
    "trees",
  ];

// Base list (only API + sorting, no daily logic)
const baseProblems = useMemo(() => {
  let list = [...problems];

  if (urlSort === "difficulty") {
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  }

  return list;
}, [problems, urlSort]);

// Daily problem (static per day)
const dailyProblem = useMemo(() => {
  if (!baseProblems.length) return null;

  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const index = seed % baseProblems.length;
  return baseProblems[index];
}, [baseProblems]);

// Final display list
const displayProblems = useMemo(() => {
  if (urlTags.includes("daily") && dailyProblem) {
    return [dailyProblem];
  }

  return baseProblems;
}, [baseProblems, urlTags, dailyProblem]);

  return (
    <section className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
            Problems
          </h1>
          <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Master data structures & algorithms with curated problems
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
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5a08a] hover:text-[#6f6251] dark:text-[#7f748a] dark:hover:text-[#d7ccbe]"
                aria-label="Clear search"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-[#f7f0e0] p-4 dark:bg-[#292331]">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">
            Difficulty:
          </label>
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
          <label className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">
            Sort:
          </label>
          <select
            value={urlSort}
            onChange={(e) => handleSort(e.target.value)}
            className="h-9 rounded-lg border border-[#deceb7] bg-white px-3 text-sm text-[#2b2116] outline-none dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
          >
            <option value="title">Default</option>
            <option value="difficulty">Difficulty</option>
            <option value="acceptance">Acceptance</option>
          </select>
        </div>
      </div>

      {/* Tags Quick Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTag(tag)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              urlTags.includes(tag)
                ? "bg-[#d69a44] text-white shadow-md dark:bg-[#f2c66f] dark:text-[#231406]"
                : "border border-[#deceb7] bg-white text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {dailyProblem && (
        <div className="relative overflow-hidden rounded-3xl border border-[#e7c27d] bg-gradient-to-br from-[#fff4da] via-[#fff9ef] to-white p-6 shadow-lg dark:border-[#f2c66f]/40 dark:from-[#1f1a24] dark:via-[#251f2c] dark:to-[#141018]">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#f2c66f]/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <h2 className="text-xl font-bold text-[#2b2116] dark:text-[#f6ede0]">
                  Daily Challenge
                </h2>
              </div>
              <p className="mt-1 text-sm text-[#6b5d4a] dark:text-[#bfb4c6]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ProblemCard
              problem={{ ...dailyProblem, tags: [...(dailyProblem.tags || []), "daily"] }}
              index={0}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedProblems.includes(dailyProblem.id)}
            />
          </div>
        </div>
      )}



      {/* Problems Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProblems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              index={index}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedProblems.includes(problem.id)}
            />
          ))}
        </div>
      )}

      {!loading && displayProblems.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl bg-[#f7f0e0] dark:bg-[#292331]">
          <h3 className="text-xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
            No Problems Found
          </h3>
          <p className="mt-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </section>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[380px] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            ></div>
          ))}
        </div>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
