"use client";

import { useEffect, useRef, useState } from "react";

export default function ProblemTimer({ running }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <span className="rounded-full border border-[#deceb7] bg-[#f2e3cc] px-3 py-1 text-xs font-medium text-[#5d5245] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]">
      ⏱ {minutes}:{secs.toString().padStart(2, "0")}
    </span>
  );
}
