"use client";
import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function ProblemsPageContent() {
  const [problems, setProblems] = useState([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState([]);
  const [solvedProblemKeys, setSolvedProblemKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();

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

  const loadSolvedProblemKeys = useCallback(async () => {
    if (typeof window === "undefined") return;

    const solvedKeys = new Set();
    const addSolvedKey = (value) => {
      if (!value) return;
      solvedKeys.add(String(value));
    };
    const isAcceptedVerdict = (value) =>
      String(value || "").trim().toLowerCase() === "accepted";

    // Keep local backup support for logged-out users and offline history.
    try {
      const raw = localStorage.getItem("algoryth_submissions");
      const parsed = raw ? JSON.parse(raw) : [];
      const solved = parsed.filter((submission) =>
        isAcceptedVerdict(submission.status || submission.verdict)
      );

      solved.forEach((submission) => {
        addSolvedKey(submission.problemId);
        addSolvedKey(submission.slug);
        addSolvedKey(submission.problemSlug);
      });
    } catch (error) {
      console.error("Failed to load solved markers from localStorage:", error);
    }

    // Prefer server truth when authenticated so solved markers stay consistent across devices.
    if (token) {
      try {
        const firstResponse = await fetch(
          "/api/submissions/history?verdict=Accepted&limit=200&page=1",
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (firstResponse.ok) {
          const firstPayload = await firstResponse.json();
          const firstBatch = Array.isArray(firstPayload?.submissions)
            ? firstPayload.submissions
            : [];

          firstBatch.forEach((submission) => {
            addSolvedKey(submission.problemId);
            addSolvedKey(submission.slug);
            addSolvedKey(submission.problemSlug);
          });

          const totalPages = Number(firstPayload?.pagination?.totalPages || 1);
          const maxPages = Math.min(totalPages, 10);

          for (let page = 2; page <= maxPages; page += 1) {
            const response = await fetch(
              `/api/submissions/history?verdict=Accepted&limit=200&page=${page}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
              }
            );

            if (!response.ok) break;

            const payload = await response.json();
            const batch = Array.isArray(payload?.submissions) ? payload.submissions : [];

            batch.forEach((submission) => {
              addSolvedKey(submission.problemId);
              addSolvedKey(submission.slug);
              addSolvedKey(submission.problemSlug);
            });
          }
        }
      } catch (error) {
        console.error("Failed to load solved markers from server:", error);
      }
    }

    setSolvedProblemKeys(Array.from(solvedKeys));
  }, [token]);

  // Load solved markers and refresh when tab/page becomes active again.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadSolvedProblemKeys();
      }
    };

    loadSolvedProblemKeys();

    window.addEventListener("focus", loadSolvedProblemKeys);
    window.addEventListener("pageshow", loadSolvedProblemKeys);
    window.addEventListener("storage", loadSolvedProblemKeys);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", loadSolvedProblemKeys);
      window.removeEventListener("pageshow", loadSolvedProblemKeys);
      window.removeEventListener("storage", loadSolvedProblemKeys);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadSolvedProblemKeys]);

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

  const getDifficultyClasses = (difficulty) => {
    if (difficulty === "Easy") {
      return "bg-[#44d07d] text-black dark:bg-[#1f5a3a] dark:text-[#d5ffd6]";
    }

    if (difficulty === "Medium") {
      return "bg-[#0f92ff] text-black dark:bg-[#244b7a] dark:text-[#d3ecff]";
    }

    return "bg-[#ff6b35] text-black dark:bg-[#5a3025] dark:text-[#ffe0d7]";
  };

  const solvedProblemKeySet = useMemo(
    () => new Set(solvedProblemKeys.map((key) => String(key))),
    [solvedProblemKeys]
  );

  const isSolved = (problem) =>
    solvedProblemKeySet.has(String(problem.id)) ||
    solvedProblemKeySet.has(String(problem.slug));

  return (
    <section className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#fff9f0]">
            Problems
          </h1>
          <p className="mt-2 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/80">
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
              className="h-10 w-full rounded-xl bg-white px-4 pr-10 text-sm font-semibold text-black placeholder:text-black/50 dark:bg-[#151525] dark:text-[#fff9f0] dark:placeholder:text-[#fff9f0]/55"
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
      <div className="neo-card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-black uppercase tracking-wide text-black dark:text-[#fff9f0]">
            Difficulty:
          </label>
          <select
            value={urlDifficulty}
            onChange={(e) => handleDifficulty(e.target.value)}
            className="h-9 rounded-lg bg-white px-3 text-sm font-black uppercase text-black dark:bg-[#151525] dark:text-[#fff9f0]"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-black uppercase tracking-wide text-black dark:text-[#fff9f0]">
            Sort:
          </label>
          <select
            value={urlSort}
            onChange={(e) => handleSort(e.target.value)}
            className="h-9 rounded-lg bg-white px-3 text-sm font-black uppercase text-black dark:bg-[#151525] dark:text-[#fff9f0]"
          >
            <option value="title">Default</option>
            <option value="difficulty">Difficulty</option>
            <option value="acceptance">Acceptance</option>
          </select>
        </div>
      </div>

      {dailyProblem && (
        <div className="neo-card relative overflow-hidden p-6">
          <div className="absolute -right-8 -top-8 h-28 w-28 rotate-12 border-4 border-black bg-[#ff6b35] dark:border-[#fef08a] dark:bg-[#2f4064]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <h2 className="text-xl font-black uppercase text-black dark:text-[#fff9f0]">
                  Daily Challenge
                </h2>
              </div>
              <p className="mt-1 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/80">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBookmark(dailyProblem.id)}
                className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide ${
                  bookmarkedProblems.includes(dailyProblem.id)
                    ? "bg-[#ff6b35] text-black dark:bg-[#fef08a]"
                    : "bg-white text-black dark:bg-[#151525] dark:text-[#fff9f0]"
                }`}
              >
                {bookmarkedProblems.includes(dailyProblem.id) ? "Bookmarked" : "Bookmark"}
              </button>
              <Link
                href={`/problems/${dailyProblem.slug}`}
                className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
              >
                Solve Daily
              </Link>
            </div>
          </div>

          <div className="mt-4 rounded-xl border-2 border-black bg-white p-4 dark:border-[#fef08a] dark:bg-[#151525]">
            <div className="text-sm font-black uppercase text-black dark:text-[#fff9f0]">
              {dailyProblem.title}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${getDifficultyClasses(
                  dailyProblem.difficulty ||
                    (dailyProblem.rating < 1300
                      ? "Easy"
                      : dailyProblem.rating < 1900
                        ? "Medium"
                        : "Hard")
                )}`}
              >
                {dailyProblem.difficulty ||
                  (dailyProblem.rating < 1300
                    ? "Easy"
                    : dailyProblem.rating < 1900
                      ? "Medium"
                      : "Hard")}
              </span>
              <span className="rounded-full border-2 border-black bg-[#fff9d0] px-3 py-1 text-[10px] font-black dark:border-[#fef08a] dark:bg-[#202037] dark:text-[#fff9f0]">
                Rating {dailyProblem.rating}
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Problems List */}
      {loading ? (
        <div className="neo-card overflow-hidden">
          <div className="grid grid-cols-[34px_minmax(0,1fr)_72px_72px] gap-2 bg-[#ff6b35] px-3 py-3 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#2f2f4a] dark:text-[#fef08a] md:grid-cols-[56px_minmax(0,2fr)_120px_110px_180px] md:gap-3 md:px-4 md:text-xs">
            <span>#</span>
            <span>Title</span>
            <span className="text-center">
              <span className="md:hidden">Diff</span>
              <span className="hidden md:inline">Difficulty</span>
            </span>
            <span className="hidden text-center md:block">Acceptance</span>
            <span className="text-right">
              <span className="md:hidden">Solve</span>
              <span className="hidden md:inline">Actions</span>
            </span>
          </div>
          <div className="divide-y-2 divide-black dark:divide-[#fef08a]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="grid animate-pulse grid-cols-[34px_minmax(0,1fr)_72px_72px] items-center gap-2 px-3 py-4 md:grid-cols-[56px_minmax(0,2fr)_120px_110px_180px] md:gap-3 md:px-4"
            >
              <div className="h-6 w-full rounded bg-[#e7dfc6] dark:bg-[#2f2f4a]" />
              <div className="h-6 w-full rounded bg-[#e7dfc6] dark:bg-[#2f2f4a]" />
              <div className="h-6 w-full rounded bg-[#e7dfc6] dark:bg-[#2f2f4a]" />
              <div className="hidden h-6 w-full rounded bg-[#e7dfc6] dark:bg-[#2f2f4a] md:block" />
              <div className="h-6 w-full rounded bg-[#e7dfc6] dark:bg-[#2f2f4a]" />
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className="neo-card overflow-hidden">
          <div className="grid grid-cols-[34px_minmax(0,1fr)_72px_72px] gap-2 bg-[#ff6b35] px-3 py-3 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#2f2f4a] dark:text-[#fef08a] md:grid-cols-[56px_minmax(0,2fr)_120px_110px_180px] md:gap-3 md:px-4 md:text-xs">
            <span>#</span>
            <span>Title</span>
            <span className="text-center">
              <span className="md:hidden">Diff</span>
              <span className="hidden md:inline">Difficulty</span>
            </span>
            <span className="hidden text-center md:block">Acceptance</span>
            <span className="text-right">
              <span className="md:hidden">Solve</span>
              <span className="hidden md:inline">Actions</span>
            </span>
          </div>

          <div className="divide-y-2 divide-black dark:divide-[#fef08a]">
          {displayProblems.map((problem, index) => (
            <div
              key={problem.id}
              className="grid grid-cols-[34px_minmax(0,1fr)_72px_72px] items-center gap-2 bg-[#fff9d0] px-3 py-3 transition-colors hover:bg-[#fff4a3] dark:bg-[#202037] dark:hover:bg-[#262645] md:grid-cols-[56px_minmax(0,2fr)_120px_110px_180px] md:gap-3 md:px-4 md:py-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-black text-[10px] font-black md:h-6 md:w-6 md:text-[11px] dark:border-[#fef08a] ${
                    isSolved(problem)
                      ? "bg-[#44d07d] text-black dark:bg-[#1f5a3a] dark:text-[#d5ffd6]"
                      : "bg-white text-black dark:bg-[#151525] dark:text-[#fff9f0]"
                  }`}
                  title={isSolved(problem) ? "Solved" : "Not solved"}
                >
                  {isSolved(problem) ? "✓" : "•"}
                </span>
                <span className="text-[11px] font-black text-black/70 md:text-xs dark:text-[#fff9f0]/70">
                  {index + 1}
                </span>
              </div>

              <div className="min-w-0">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="block truncate text-[11px] font-black uppercase text-black hover:underline md:text-sm dark:text-[#fff9f0]"
                >
                  {problem.title}
                </Link>
              </div>

              <div className="flex justify-center">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase md:px-3 md:text-[10px] ${getDifficultyClasses(
                    problem.difficulty ||
                      (problem.rating < 1300
                        ? "Easy"
                        : problem.rating < 1900
                          ? "Medium"
                          : "Hard")
                  )}`}
                >
                  {problem.difficulty ||
                    (problem.rating < 1300
                      ? "Easy"
                      : problem.rating < 1900
                        ? "Medium"
                        : "Hard")}
                </span>
              </div>

              <div className="hidden text-center text-[10px] font-black text-black md:block md:text-xs dark:text-[#fff9f0]">
                {problem.acceptanceRate || 0}%
              </div>

              <div className="flex items-center justify-end gap-1.5 md:gap-2">
                <button
                  onClick={() => handleBookmark(problem.id)}
                  aria-label={bookmarkedProblems.includes(problem.id) ? "Unsave problem" : "Save problem"}
                  className={`hidden h-8 w-8 items-center justify-center rounded-lg md:inline-flex ${
                    bookmarkedProblems.includes(problem.id)
                      ? "bg-[#ff6b35] text-black dark:bg-[#fef08a]"
                      : "bg-white text-black dark:bg-[#151525] dark:text-[#fff9f0]"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill={bookmarkedProblems.includes(problem.id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                <Link
                  href={`/problems/${problem.slug}`}
                  className="rounded-lg bg-[#0f92ff] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-black md:px-3 md:py-1.5 md:text-[10px] dark:bg-[#fef08a]"
                >
                  Solve
                </Link>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {!loading && displayProblems.length === 0 && (
        <div className="neo-card flex flex-col items-center justify-center rounded-xl py-16 text-center">
          <h3 className="text-xl font-black uppercase text-black dark:text-[#fff9f0]">
            No Problems Found
          </h3>
          <p className="mt-2 text-sm font-semibold text-black/80 dark:text-[#fff9f0]/80">
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
        <div className="neo-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-18 border-b-2 border-black bg-[#fff9d0] dark:border-[#fef08a] dark:bg-[#202037] animate-pulse"
            />
          ))}
        </div>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
