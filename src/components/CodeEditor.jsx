"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useRef } from "react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import {
  Settings,
  RotateCcw,
  Copy,
  Share2,
  FileCode,
  ChevronDown,
  Wand2,
  Check,
  History,
  Keyboard,
  X
} from "lucide-react";
import { getTemplate } from "../utils/editorUtils";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}) {
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");
  const [isFormatting, setIsFormatting] = useState(false);
  const [minimapEnabled, setMinimapEnabled] = useState(false);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageObj, setShowLanguageObj] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    setCode(initialCode || "");
  }, [initialCode]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Format: Ctrl+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handleAutoFormat();
      }

      // Run: Ctrl+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isRunning && !isSubmitting) onRun?.();
      }

      // Submit: Ctrl+Shift+Enter
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning && !isSubmitting) onSubmit?.();
      }

      // Help: Shift+? (which is just ?) or Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, isRunning, isSubmitting, showShortcuts]); // Re-bind if dependencies change to ensure latest state

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register custom action for formatting
    editor.addAction({
      id: 'format-code',
      label: 'Format Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
      run: () => {
        handleAutoFormat();
      }
    });

    // Run custom action
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => {
        onRun?.();
      }
    });

    // Provide snippets (basic example)
    // In a real app, you'd likely want to register these globally once or manage disposables
  };

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
      onChange?.(formatted);
    } catch (error) {
      console.error("Formatting failed:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy command:", err);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the code to the default template? This cannot be undone.")) {
      const template = getTemplate(language);
      setCode(template);
      onChange?.(template);
    }
  };

  const handleLanguageSwitch = (newLang) => {
    setLanguage(newLang);
    onLanguageChange?.(newLang);

    // Check if code is empty or just default template of previous lang, if so, switch to new template
    // For simplicity, we'll just check if it's "mostly" empty or user requests it. 
    // Actually, let's prompt or just do it if code length is small.
    // For this feature request, "Create language selector dropdown with template starters" implies checking.
    // Let's rely on manual reset for now to avoid losing user work, or just change if empty.

    const currentTemplate = getTemplate(language);
    if (!code || code.trim() === '' || code.trim() === currentTemplate.trim()) {
      const newTemplate = getTemplate(newLang);
      setCode(newTemplate);
      onChange?.(newTemplate);
    }

    setShowLanguageObj(false);
  };

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: minimapEnabled },
      fontSize: 14,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      scrollBeyondLastLine: false,
      wordWrap: wordWrapEnabled ? "on" : "off",
      padding: { top: 14, bottom: 14 },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      renderLineHighlight: "line",
      automaticLayout: true,
    }),
    [minimapEnabled, wordWrapEnabled]
  );

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
    { id: "go", name: "Go" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-[#e0d5c2] bg-[#f2e3cc] dark:border-[#3c3347] dark:bg-[#292331]">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Language Selector & Settings */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowLanguageObj(!showLanguageObj)}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5245] shadow-sm hover:bg-[#f6e9d2] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{languages.find(l => l.id === language)?.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

              {showLanguageObj && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLanguageObj(false)} />
                  <div className="absolute top-full left-0 z-20 mt-1 w-32 overflow-hidden rounded-xl border border-[#e0d5c2] bg-white shadow-lg dark:border-[#3c3347] dark:bg-[#221d2b]">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageSwitch(lang.id)}
                        className={`block w-full px-4 py-2 text-left text-xs ${language === lang.id
                          ? "bg-[#f2e3cc] text-[#2b1a09] dark:bg-[#2d2535] dark:text-[#f6ede0]"
                          : "text-[#5d5245] hover:bg-[#f6e9d2] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
                          }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${showSettings
                  ? "bg-[#e0d5c2] text-[#2b1a09] dark:bg-[#3c3347] dark:text-[#f6ede0]"
                  : "text-[#8a7a67] hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
                  }`}
                title="Editor Settings"
              >
                <Settings className="h-4 w-4" />
              </button>

              {showSettings && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                  <div className="absolute top-full left-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#e0d5c2] bg-white p-2 shadow-lg dark:border-[#3c3347] dark:bg-[#221d2b]">
                    <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-[#8a7a67] dark:text-[#7f748a]">
                      View Options
                    </div>
                    <button
                      onClick={() => setMinimapEnabled(!minimapEnabled)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-[#5d5245] hover:bg-[#f6e9d2] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
                    >
                      <span>Minimap</span>
                      {minimapEnabled && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => setWordWrapEnabled(!wordWrapEnabled)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-[#5d5245] hover:bg-[#f6e9d2] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
                    >
                      <span>Word Wrap</span>
                      {wordWrapEnabled && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => alert("Execution History coming soon!")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Execution History"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </div>

          {/* Center: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleAutoFormat}
              disabled={isFormatting || language !== 'javascript'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] disabled:opacity-30 dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Format Code (Ctrl+Shift+F)"
            >
              <Wand2 className={`h-4 w-4 ${isFormatting ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={handleReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Reset to Template"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-[#e0d5c2] dark:bg-[#3c3347]" />
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Copy Code"
            >
              {copied ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={() => alert("Share Code functionality coming soon!")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7a67] transition-colors hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
              title="Share Code"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Run Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold text-[#5d5245] transition-colors hover:bg-[#f6e9d2] disabled:opacity-50 dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              onClick={() => onRun?.()}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? "Running..." : "Run"}
            </button>

            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-[#d69a44] px-3 text-xs font-bold text-[#2b1a09] transition-colors hover:bg-[#c99a4c] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#f2d580]"
              onClick={() => onSubmit?.()}
              disabled={isRunning || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-72 flex-1 min-w-0 bg-[#fff8ed] dark:bg-[#1e1e1e]">
        <Monaco
          height="100%"
          theme={theme}
          language={language}
          value={code}
          onMount={handleEditorDidMount}
          onChange={(v) => {
            const newCode = v ?? "";
            setCode(newCode);
            onChange?.(newCode);
          }}
          options={editorOptions}
        />

        {/* Shortcuts Modal */}
        {showShortcuts && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-80 rounded-2xl border border-[#e0d5c2] bg-white p-6 shadow-xl dark:border-[#3c3347] dark:bg-[#211d27]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#2b2116] dark:text-[#f6ede0]">Shortcuts</h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="rounded-full p-1 text-[#8a7a67] hover:bg-[#f6e9d2] dark:text-[#b5a59c] dark:hover:bg-[#2d2535]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5d5245] dark:text-[#d7ccbe]">Format Code</span>
                  <kbd className="rounded bg-[#f2e3cc] px-2 py-1 font-mono text-xs dark:bg-[#2d2535]">Ctrl + Shift + F</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5d5245] dark:text-[#d7ccbe]">Run Code</span>
                  <kbd className="rounded bg-[#f2e3cc] px-2 py-1 font-mono text-xs dark:bg-[#2d2535]">Ctrl + Enter</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5d5245] dark:text-[#d7ccbe]">Submit</span>
                  <kbd className="rounded bg-[#f2e3cc] px-2 py-1 font-mono text-xs dark:bg-[#2d2535]">Ctrl + Shift + Enter</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5d5245] dark:text-[#d7ccbe]">Reset Code</span>
                  <span className="text-xs text-[#8a7a67] dark:text-[#7f748a]">(Toolbar Only)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5d5245] dark:text-[#d7ccbe]">Show Help</span>
                  <kbd className="rounded bg-[#f2e3cc] px-2 py-1 font-mono text-xs dark:bg-[#2d2535]">Ctrl + /</kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-[#e0d5c2] bg-[#fdf7ed] px-4 py-1.5 text-[10px] uppercase tracking-wider text-[#8a7a67] dark:border-[#3c3347] dark:bg-[#1f1b27] dark:text-[#7f748a]">
        <div className="flex gap-4">
          <span>Ln {code.split('\n').length}, Col 1</span>
          <span>{code.length} chars</span>
        </div>
        <div>
          {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
