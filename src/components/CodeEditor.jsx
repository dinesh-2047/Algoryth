"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Starter code templates for different languages
const getStarterCode = (language, problemTitle = "Problem") => {
  const templates = {
    javascript: `// ${problemTitle}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    typescript: `// ${problemTitle}\n\nfunction solve(input: any): any {\n  // TODO\n}\n`,
    python: `# ${problemTitle}\n\ndef solve(input):\n    # TODO\n    pass\n`,
    cpp: `// ${problemTitle}\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // TODO\n};\n`,
    java: `// ${problemTitle}\n\npublic class Solution {\n    // TODO\n}\n`,
  };
  
  return templates[language] || templates.javascript;
};

export default function CodeEditor({
  initialCode,
  initialLanguage = "javascript",
  problemTitle,
}) {
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");

  // Generate code based on language and initial props
  const code = useMemo(() => {
    if (initialCode) return initialCode;
    return getStarterCode(language, problemTitle);
  }, [initialCode, language, problemTitle]);

  const [editorCode, setEditorCode] = useState(code);

  // Update editor code when computed code changes (language change or initial props)
  useEffect(() => {
    setEditorCode(code);
  }, [code]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const update = () => setTheme(mq?.matches ? "vs-dark" : "vs");
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="border-b border-black/10 bg-zinc-50 px-5 py-3 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Code</div>
          <div className="flex items-center gap-2">
            {/* Language */}
            <select
              className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">
                TypeScript
              </option>
              <option value="python">
                Python
              </option>
              <option value="java">
                Java
              </option>
              <option value="cpp">
                C++
              </option>
            </select>

            {/* Auto format */}
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-black/3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Auto
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
          value={editorCode}
          onChange={(v) => setEditorCode(v ?? "")}
          options={editorOptions}
        />
      </div>
    </div>
  );
}
