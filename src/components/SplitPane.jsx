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
    const maxPrimary = Math.max(minPrimary, total - minSecondary);
    return Math.min(Math.max(nextSize, minPrimary), maxPrimary);
  }, [isHorizontal, minPrimary, minSecondary]);

  function onPointerDown(e) {
    const el = containerRef.current;
    if (!el) return;
    draggingRef.current = true;

    const pointer = isHorizontal ? e.clientX : e.clientY;
    startRef.current = { pointer, primary: primarySize };

    e.preventDefault();
  }

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
      className={`flex ${isHorizontal ? "flex-row" : "flex-col"
        } gap-0 ${className}`}
    >
      <div style={primaryStyle} className="min-w-0 min-h-0">
        {primary}
      </div>

      <div
        role="separator"
        tabIndex={0}
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        onPointerDown={onPointerDown}
        className={
          isHorizontal
            ? "group relative w-3 cursor-col-resize"
            : "group relative h-3 cursor-row-resize"
        }
      >
        <div
          className={
            isHorizontal
              ? "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-300 group-hover:bg-zinc-400 dark:bg-white/10 dark:group-hover:bg-white/20"
              : "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-300 group-hover:bg-zinc-400 dark:bg-white/10 dark:group-hover:bg-white/20"
          }
        />
      </div>

      <div className="min-w-0 min-h-0 flex-1">{secondary}</div>
    </div>
  );
}
