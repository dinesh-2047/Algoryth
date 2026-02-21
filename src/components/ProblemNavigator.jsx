"use client";

import { useState } from "react";
import { problems } from "../lib/problems";
import ProblemWorkspace from "./ProblemWorkspace";
import { fetchProblemStatuses } from "../lib/problemStatusApi";

export default function ProblemNavigator({ initialSlug }) {
  const initialIndex = problems.findIndex(
    (p) => p.slug === initialSlug
  );

  const [currentPId, setCurrentPId] = useState(initialIndex);

  const handleNext = () => {
    if (currentPId < problems.length - 1) {
      setCurrentPId((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPId > 0) {
      setCurrentPId((prev) => prev - 1);
    }
  };

  const handleSubmissionComplete = async () => {
    // Refetch problem statuses to update indicators
    try {
      await fetchProblemStatuses();
    } catch (error) {
      console.error("Error refetching statuses:", error);
    }
  };

  return (
    <ProblemWorkspace
      key={problems[currentPId].slug}   // ✅ IMPORTANT
      problem={problems[currentPId]}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmissionComplete={handleSubmissionComplete}
    />
  );
}
