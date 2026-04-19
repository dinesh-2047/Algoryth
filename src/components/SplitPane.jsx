"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function SplitPane({
  direction = "horizontal",
  minPrimary = 280,
  minSecondary = 320,
  initialPrimary = 560,
  storageKey,
  primary,
  secondary,
  className = "",
}) {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ pointer: 0, primary: 0 });
  const separatorSize = 16;

  const isHorizontal = direction === "horizontal";
  const [primarySize, setPrimarySize] = useState(initialPrimary);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n)) setPrimarySize(n);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, String(primarySize));
    } catch {
      // ignore
    }
  }, [primarySize, storageKey]);

  const primaryStyle = useMemo(
    () => ({
      flex: "0 0 auto",
      width: isHorizontal ? `${primarySize}px` : "auto",
      height: isHorizontal ? "auto" : `${primarySize}px`,
      minWidth: isHorizontal ? `${minPrimary}px` : undefined,
      minHeight: !isHorizontal ? `${minPrimary}px` : undefined,
    }),
    [isHorizontal, minPrimary, primarySize]
  );

  const clampSize = useCallback((nextSize) => {
    const el = containerRef.current;
    if (!el) return nextSize;

    const rect = el.getBoundingClientRect();
    const total = isHorizontal ? rect.width : rect.height;
    const maxPrimary = Math.max(0, total - minSecondary - separatorSize);
    const effectiveMinPrimary = Math.min(minPrimary, maxPrimary);
    return Math.min(Math.max(nextSize, effectiveMinPrimary), maxPrimary);
  }, [isHorizontal, minPrimary, minSecondary, separatorSize]);

  function onPointerDown(e) {
    const el = containerRef.current;
    if (!el) return;
    draggingRef.current = true;

    const pointer = isHorizontal ? e.clientX : e.clientY;
    startRef.current = { pointer, primary: primarySize };

    e.preventDefault();
  }

  useEffect(() => {
    setPrimarySize((s) => clampSize(s));
  }, [clampSize]);

  useEffect(() => {
    function onResize() {
      setPrimarySize((s) => clampSize(s));
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isHorizontal, minPrimary, minSecondary, clampSize]);

  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return;
      const pointer = isHorizontal ? e.clientX : e.clientY;
      const delta = pointer - startRef.current.pointer;
      setPrimarySize(clampSize(startRef.current.primary + delta));
    }

    function onUp() {
      draggingRef.current = false;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isHorizontal, minPrimary, minSecondary, clampSize]);

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full min-h-0 min-w-0 select-none ${
        isHorizontal ? "flex-row" : "flex-col"
      } gap-0 ${className}`}
    >
      <div style={primaryStyle} className="min-w-0 min-h-0 overflow-hidden">
        {primary}
      </div>

      <div
        role="separator"
        tabIndex={0}
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        onPointerDown={onPointerDown}
        className={
          isHorizontal
            ? "group relative z-10 w-4 shrink-0 cursor-col-resize touch-none rounded-sm border border-black/30 bg-[#ece3bf] dark:border-[#fef08a]/40 dark:bg-[#1b1c33]"
            : "group relative z-10 h-4 shrink-0 cursor-row-resize touch-none rounded-sm border border-black/30 bg-[#ece3bf] dark:border-[#fef08a]/40 dark:bg-[#1b1c33]"
        }
      >
        <div
          className={
            isHorizontal
              ? "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25 group-hover:bg-black/45 dark:bg-[#7d8fc4]/35 dark:group-hover:bg-[#7d8fc4]/70"
              : "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/25 group-hover:bg-black/45 dark:bg-[#7d8fc4]/35 dark:group-hover:bg-[#7d8fc4]/70"
          }
        />
        <div
          className={
            isHorizontal
              ? "absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/15 group-hover:bg-black/30 dark:bg-[#7d8fc4]/30 dark:group-hover:bg-[#7d8fc4]/55"
              : "absolute left-1/2 top-1/2 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/15 group-hover:bg-black/30 dark:bg-[#7d8fc4]/30 dark:group-hover:bg-[#7d8fc4]/55"
          }
        />
      </div>

      <div className="min-w-0 min-h-0 flex-1 overflow-hidden">{secondary}</div>
    </div>
  );
}
