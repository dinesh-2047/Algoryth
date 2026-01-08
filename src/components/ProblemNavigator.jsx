"use client";

import { problems } from "../lib/problems";
import { useState } from "react";
import ProblemWorkspace from "./ProblemWorkspace";

export default function ProblemNavigator({initialSlug}) {

    const pId = problems.findIndex(
        (p) => p.slug === initialSlug
    );

    const [currentPId, setCurrentPId] = useState(pId);

    const handleNext = () => {
        if (currentPId < problems.length - 1) {
            const nextPId = currentPId+1;
            setCurrentPId(nextPId);
        }
    }

    const handlePrev = () => {
        if (currentPId > 0) {
            const prevPId = currentPId - 1;
            setCurrentPId(prevPId);
        }
    }

    return (
        <ProblemWorkspace
        problem={problems[currentPId]}
        onNext={handleNext}
        onPrev={handlePrev}
        />
    );

}