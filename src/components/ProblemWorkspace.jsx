"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";

export default function ProblemWorkspace({ problem, onNext, onPrev }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);

  const starterCode = useMemo(
    () => `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState(false);

  const leftPanel = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
      <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-5 py-4 dark:border-[#3c3347] dark:bg-[#292331]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
              {problem.id}
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#2b2116] dark:text-[#f6ede0]">
              {problem.title}
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#f2e3cc] px-3 py-1 text-xs font-medium text-[#5d5245] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]">
            {problem.difficulty}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setActiveTab("description")}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
              activeTab === "description"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/10 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("editorial")}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
              activeTab === "editorial"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/10 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
            }`}
          >
            Editorial
          </button>
          <button
            onClick={() => setActiveTab("solutions")}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
              activeTab === "solutions"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/10 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
              activeTab === "submissions"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/10 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => {
              if (!showHints) {
                fetch(`/api/problems/${problem.slug}/hints`)
                  .then(res => res.json())
                  .then(data => setHints(data));
              }
              setShowHints(!showHints);
            }}
            className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400"
          >
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {problem.tags.map((t) => (
            <span
              key={`${problem.id}-${t}`}
              className="inline-flex items-center rounded-full border border-[#deceb7] bg-[#f2e3cc] px-3 py-1 text-xs text-[#5d5245] dark:border-[#40364f] dark:bg-[#2d2535] dark:text-[#d7ccbe]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <article className="min-h-0 flex-1 overflow-auto px-5 py-5">
        {activeTab === "description" && (
          <>
            <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {problem.statement}
            </p>

            <h3 className="mt-6 text-sm font-semibold">Constraints</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {problem.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold">Examples</h3>
            <div className="mt-2 grid gap-3">
              {problem.examples.map((ex, i) => (
                <div
                  key={`${problem.id}-ex-${i}`}
                  className="rounded-xl border border-black/10 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-zinc-950"
                >
                  <div className="font-medium">Input</div>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {ex.input}
                  </pre>
                  <div className="mt-3 font-medium">Output</div>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {ex.output}
                  </pre>
                </div>
              ))}
            </div>

            {showHints && hints.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold">Hints</h3>
                <div className="mt-2 space-y-2">
                  {hints.map((hint) => (
                    <div
                      key={hint.level}
                      className="rounded-xl border border-black/10 bg-amber-50 p-4 text-sm dark:border-white/10 dark:bg-amber-950"
                    >
                      <div className="font-medium">Hint {hint.level}</div>
                      <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                        {hint.text}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "editorial" && problem.editorial && (
          <>
            <h3 className="text-sm font-semibold">Approach</h3>
            <ol className="mt-2 list-decimal pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {problem.editorial.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <h3 className="mt-6 text-sm font-semibold">Solution</h3>
            <pre className="mt-2 rounded-xl border border-black/10 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-zinc-950">
              {problem.editorial.solution}
            </pre>

            <h3 className="mt-6 text-sm font-semibold">Complexity</h3>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {problem.editorial.complexity}
            </p>
          </>
        )}

        {activeTab === "solutions" && problem.editorial && (
          <>
            <h3 className="text-sm font-semibold">Solution Code</h3>
            <pre className="mt-2 rounded-xl border border-black/10 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-zinc-950">
              {problem.editorial.solution}
            </pre>
          </>
        )}

        {activeTab === "submissions" && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Submissions history will be shown here.
          </p>
        )}
      </article>
    </div>
  );

  const rightPanel = (
    <SplitPane
      direction="vertical"
      initialPrimary={680}
      minPrimary={260}
      minSecondary={220}
      storageKey={`algoryth.split.editor.${problem.slug}`}
      className="h-215 lg:h-full"
      primary={<CodeEditor initialLanguage={language} initialCode={code || starterCode} onChange={setCode} onLanguageChange={setLanguage} />}
      secondary={
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] dark:border-[#3c3347] dark:bg-[#292331]">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold">
              <span className="rounded-full bg-[#edd9b8] px-3 py-1 text-[#4b4033] dark:bg-[#f6ede0] dark:text-[#231406]">
                Test Result
              </span>
              <span className="text-[#8a7a67] dark:text-[#b5a59c]">Testcase</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-5 pt-3 text-center text-sm text-[#8a7a67] dark:text-[#b5a59c]">
            {lastSubmissionStatus || "You must run your code first."}
          </div>
        </div>
      }
    />
  );

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] px-4 py-3 dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="flex items-center gap-2">
          <Link
            href="/problems"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
          >
            Problems
          </Link>
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb7] bg-[#fff8ed] text-sm text-[#5d5245] hover:bg-[#f2e3cc] disabled:opacity-50 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            aria-label="Previous"
            onClick={onPrev}
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#deceb7] bg-[#fff8ed] text-sm text-[#5d5245] hover:bg-[#f2e3cc] disabled:opacity-50 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            aria-label="Next"
            onClick={onNext}
          >
            {">"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="hidden lg:block h-225">
        <SplitPane
          direction="horizontal"
          initialPrimary={760}
          minPrimary={420}
          minSecondary={420}
          storageKey={`algoryth.split.problem.${problem.slug}`}
          primary={leftPanel}
          secondary={rightPanel}
          className="h-full"
        />
      </div>

      <div className="grid gap-4 lg:hidden">
        {leftPanel}
        {rightPanel}
      </div>
    </section>
  );
}
