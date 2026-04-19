"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
}) {
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [isFormatting, setIsFormatting] = useState(false);

  /* ---------------- File upload ---------------- */
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'cpp',
      'go': 'go',
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        onChange?.(content);
        
        // set language
        if (extension && languageMap[extension]) {
          const detectedLanguage = languageMap[extension];
          setLanguage(detectedLanguage);
          onLanguageChange?.(detectedLanguage);
        }
      }
    };
    reader.readAsText(file);
    // reseting the event value
    event.target.value = '';
  };

  /* ---------------- Sync initial code ---------------- */
  useEffect(() => {
    setCode(initialCode || "");
  }, [initialCode]);

  /* ---------------- Theme sync ---------------- */
  useEffect(() => {
    if (selectedTheme !== "system") {
      setTheme(selectedTheme);
      return;
    }

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
  }, [selectedTheme]);

  /* ---------------- Auto format ---------------- */
  const handleAutoFormat = async () => {
    setIsFormatting(true);
    try {
      const { formatCode } = await import("@/lib/formatters");
      const formatted = await formatCode(code, language);
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#fff9d0] shadow-[2px_2px_0_0_#000] dark:border-[#fef08a] dark:bg-[#202037] dark:shadow-[2px_2px_0_0_#a9b9db]">
      {/* Toolbar */}
      <div className="border-b-2 border-black bg-[#ff6b35] px-5 py-3 dark:border-[#fef08a] dark:bg-[#2f2f4a]">
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap sm:gap-2">
          <div className="hidden shrink-0 text-sm font-black uppercase tracking-wide text-black dark:text-[#fef08a] sm:block">
            Code
          </div>
          <div className="hidden h-6 w-px bg-black/30 dark:bg-[#fef08a]/40 sm:block" />

          <div className="flex min-w-max items-center gap-1 sm:gap-2">
            {/* Theme Switcher */}
            <select
              className="h-7 w-20 rounded-xl bg-[#fff9d0] px-2 text-[9px] font-black uppercase tracking-wide text-black sm:h-9 sm:w-auto sm:px-3 sm:text-xs dark:bg-[#151525] dark:text-[#fff9f0]"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              title="Editor Theme"
            >
              <option value="system">System</option>
              <option value="vs-dark">Dark</option>
              <option value="vs">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>

            {/* Language */}
            <select
              className="h-7 w-24 rounded-xl bg-[#fff9d0] px-2 text-[9px] font-black uppercase tracking-wide text-black sm:h-9 sm:w-auto sm:px-3 sm:text-xs dark:bg-[#151525] dark:text-[#fff9f0]"
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

            {/* Upload file */}
            <label
              htmlFor="code-file-upload"
              className="inline-flex h-7 cursor-pointer items-center justify-center rounded-xl bg-white px-2 text-[9px] font-black uppercase tracking-wide text-black hover:bg-[#44d07d] sm:h-9 sm:px-4 sm:text-xs dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2a3c2f]"
              title="Upload code file"
            >
              Upload
            </label>
            <input
              id="code-file-upload"
              type="file"
              accept=".js,.ts,.py,.java,.cpp,.c,.cc,.cxx,.go"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Auto format */}
            <button
              type="button"
              onClick={handleAutoFormat}
              disabled={isFormatting}
              className="inline-flex h-7 items-center justify-center rounded-xl bg-white px-2 text-[9px] font-black uppercase tracking-wide text-black hover:bg-[#44d07d] disabled:opacity-50 sm:h-9 sm:px-4 sm:text-xs dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2a3c2f]"
              title="Auto format (JavaScript only)"
            >
              {isFormatting ? "Formatting..." : "Auto"}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={resetCode}
              title="Reset code (Ctrl + B)"
              className="inline-flex h-7 items-center justify-center rounded-xl bg-white px-2 text-[9px] font-black uppercase tracking-wide text-black hover:bg-[#0f92ff] sm:h-9 sm:px-4 sm:text-xs dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2d3f63]"
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
