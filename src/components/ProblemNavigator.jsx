"use client";

import { useMemo, useState, useEffect } from "react";
import ProblemWorkspace from "./ProblemWorkspace";
import Spinner from "./Spinner";

export default function ProblemNavigator({
  initialSlug,
  initialProblem,
  problemList = [],
  contestSlug,
}) {
  const initialIndex = useMemo(
    () =>
      Math.max(
        0,
        problemList.findIndex((problem) => problem.slug === initialSlug)
      ),
    [initialSlug, problemList]
  );

  const [currentPId, setCurrentPId] = useState(initialIndex);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [problemCache, setProblemCache] = useState(() => ({
    [initialProblem.slug]: initialProblem,
  }));

  const currentMetaProblem =
    problemList[currentPId] ||
    problemList.find((problem) => problem.slug === initialSlug) ||
    initialProblem;

  const currentSlug = currentMetaProblem?.slug || initialSlug;
  const currentProblem = problemCache[currentSlug] || null;

  useEffect(() => {
    let cancelled = false;

    const loadProblem = async () => {
      if (!currentSlug || problemCache[currentSlug]) return;

      setLoadingProblem(true);

      try {
        const querySuffix = contestSlug
          ? `?contest=${encodeURIComponent(contestSlug)}`
          : "";

        const response = await fetch(`/api/problems/${currentSlug}${querySuffix}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch problem ${currentSlug}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setProblemCache((prev) => ({
            ...prev,
            [currentSlug]: data,
          }));
        }
      } catch (error) {
        console.error("Unable to load problem details:", error);
      } finally {
        if (!cancelled) {
          setLoadingProblem(false);
        }
      }
    };

    loadProblem();

    return () => {
      cancelled = true;
    };
  }, [contestSlug, currentSlug, problemCache]);

  const canGoPrev = currentPId > 0;
  const canGoNext = currentPId < problemList.length - 1;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentPId((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentPId((prev) => prev - 1);
    }
  };

  if (!currentProblem || loadingProblem) {
    return (
      <div className="flex min-h-90 items-center justify-center rounded-2xl border-4 border-black bg-[#fff34d] shadow-[4px_4px_0_0_#000] dark:border-[#fef08a] dark:bg-[#11111a] dark:shadow-[4px_4px_0_0_#a9b9db]">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-black dark:text-[#fef08a]">
          <Spinner className="h-4 w-4" />
          Loading problem
        </div>
      </div>
    );
  }

  return (
    <ProblemWorkspace
      key={currentProblem.slug}
      problem={currentProblem}
      contestSlug={contestSlug}
      onNext={canGoNext ? handleNext : undefined}
      onPrev={canGoPrev ? handlePrev : undefined}
    />
  );
}
