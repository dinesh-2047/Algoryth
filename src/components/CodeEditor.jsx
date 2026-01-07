"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { format } from "prettier";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  code,
  language = "javascript",
  onCodeChange,
  onLanguageChange,
  onRun,
}) {
  const [theme, setTheme] = useState("vs-dark");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const update = () => setTheme(mq?.matches ? "vs-dark" : "vs");
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const handleAutoFormat = async () => {
    setIsFormatting(true);
    try {
      const parser = language === "javascript" ? "babel" : "babel"; // Default to babel for now
      const formatted = await format(code, {
        parser,
        semi: true,
        singleQuote: true,
        trailingComma: "es5",
      });
      setCode(formatted);
    } catch (error) {
      console.error("Formatting failed:", error);
    } finally {
      setIsFormatting(false);
    }
  };

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="border-b border-black/10 bg-zinc-50 px-5 py-3 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Code</div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              value={language}
              onChange={(e) => {
                const newLanguage = e.target.value;
                if (onLanguageChange) onLanguageChange(newLanguage);
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-black/3 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
              onClick={handleAutoFormat}
              disabled={isFormatting}
            >
              {isFormatting ? "Formatting..." : "Auto"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRun) {
                  setIsRunning(true);
                  onRun({ code, language }).finally(() => setIsRunning(false));
                }
              }}
              disabled={isRunning || !onRun}
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-black/3 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              {isRunning ? "Running..." : "Run"}
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
          onChange={(v) => {
            if (onCodeChange) onCodeChange(v ?? "");
          }}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
