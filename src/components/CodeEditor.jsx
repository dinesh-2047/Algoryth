"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";

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

  const handleAutoFormat = async () => {
    setIsFormatting(true);
    try {
      if (language !== "javascript") {
        console.warn(`Auto-format is only available for JavaScript, received ${language}.`);
        return;
      }

      const formatted = await prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel],
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
      <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-5 py-3 dark:border-[#3c3347] dark:bg-[#292331]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-[#5d5245] dark:text-[#d7ccbe]">Code</div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-full border border-[#deceb7] bg-[#fff8ed] px-3 text-xs font-semibold text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
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
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-white px-4 text-xs font-semibold text-[#5d5245] hover:bg-[#f6e9d2] disabled:opacity-50 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
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
