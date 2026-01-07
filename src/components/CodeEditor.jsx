"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
}) {
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");

  useEffect(() => {
    setCode(initialCode || "");
  }, [initialCode]);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "vs-dark" : "vs");
    };

    // Initial theme check
    updateTheme();

    // Watch for changes to the dark class on document element
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also listen to system preference changes as fallback
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      // Only update if there's no stored theme preference
      if (!localStorage.getItem("theme")) {
        updateTheme();
      }
    };
    mq?.addEventListener?.("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mq?.removeEventListener?.("change", handleSystemChange);
    };
  }, []);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      padding: { top: 14, bottom: 14 },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      renderLineHighlight: "line",
    }),
    []
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-amber-50 dark:border-white/10 dark:bg-black">
      <div className="border-b border-black/10 bg-amber-100 px-5 py-3 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Code</div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-full border border-black/10 bg-amber-50 px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript" disabled>
                TypeScript (soon)
              </option>
              <option value="cpp" disabled>
                C++ (soon)
              </option>
              <option value="python" disabled>
                Python (soon)
              </option>
            </select>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-amber-50 px-4 text-xs font-semibold text-zinc-700 hover:bg-amber-200 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-72 flex-1 min-w-0">
        <Monaco
          height="100%"
          theme={theme}
          language={language}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
