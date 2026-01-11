"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  isSubmitting,
}) {
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");
  const [isFormatting, setIsFormatting] = useState(false);

  /* ---------------- Sync initial code ---------------- */
  useEffect(() => {
    setCode(initialCode || "");
  }, [initialCode]);

  /* ---------------- Theme sync ---------------- */
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "vs-dark" : "vs");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (!localStorage.getItem("theme")) updateTheme();
    };

    mq?.addEventListener?.("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mq?.removeEventListener?.("change", handleSystemChange);
    };
  }, []);

  /* ---------------- Auto format ---------------- */
  const handleAutoFormat = async () => {
    if (language !== "javascript") return;

    setIsFormatting(true);
    try {
      const formatted = await prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel],
        semi: true,
        singleQuote: true,
        trailingComma: "es5",
      });
      setCode(formatted);
      onChange?.(formatted);
    } catch (err) {
      console.error("Formatting failed:", err);
    } finally {
      setIsFormatting(false);
    }
  };

  /* ---------------- Reset code ---------------- */
  const resetCode = () => {
    if (onReset) {
      onReset();
    } else {
      setCode(initialCode || "");
      onChange?.(initialCode || "");
    }
  };

  /* ---------------- Keyboard shortcuts ---------------- */
  const handleEditorDidMount = (editor, monaco) => {
    // Ctrl / Cmd + Enter → Run
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => onRun?.()
    );

    // Ctrl / Cmd + Shift + Enter → Submit
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => onSubmit?.()
    );

    // Ctrl / Cmd + B → Reset
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
      resetCode
    );
  };

  /* ---------------- Editor options ---------------- */
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
      {/* Toolbar */}
      <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-5 py-3 dark:border-[#3c3347] dark:bg-[#292331]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-[#5d5245] dark:text-[#d7ccbe]">
            Code
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <select
              className="h-9 rounded-full border border-[#deceb7] bg-[#fff8ed] px-3 text-xs font-semibold text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                onLanguageChange?.(e.target.value);
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
            </select>

            {/* Auto format */}
            <button
              type="button"
              onClick={handleAutoFormat}
              disabled={isFormatting}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-white px-4 text-xs font-semibold hover:bg-[#f6e9d2] disabled:opacity-50 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              title="Auto format (JavaScript only)"
            >
              {isFormatting ? "Formatting..." : "Auto"}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={resetCode}
              title="Reset code (Ctrl + B)"
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-white px-4 text-xs font-semibold text-[#5d5245] hover:bg-[#f6e9d2] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-72 flex-1 min-w-0">
        <Monaco
          height="100%"
          theme={theme}
          language={language}
          value={code}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={(v) => {
            const newCode = v ?? "";
            setCode(newCode);
            onChange?.(newCode);
          }}
        />
      </div>
    </div>
  );
}
