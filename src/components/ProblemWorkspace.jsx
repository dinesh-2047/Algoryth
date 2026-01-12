"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";

export default function ProblemWorkspace({ problem }) {
  const [executionResults, setExecutionResults] = useState(null);

  const starterCode = useMemo(
    () => `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );

  const handleRun = async ({ code, language }) => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });

      const data = await response.json();
      setExecutionResults(data);
    } catch (error) {
      setExecutionResults({ error: 'Failed to execute code. Please try again.' });
    }
  };


  const toggleHint = (i) => {
    setOpenHints((prev) => 
      prev.includes(i) ? prev.filter((x) => x!=i) : [...prev, i]
    );
  };

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
        <p className="whitespace-pre-wrap text-sm leading-6 text-[#5d5245] dark:text-[#d7ccbe]">
          {problem.statement}
        </p>

        <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
          Constraints
        </h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
          {problem.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
          Examples
        </h3>
        <div className="mt-2 grid gap-3">
          {problem.examples.map((ex, i) => (
            <div
              key={`${problem.id}-ex-${i}`}
              className="rounded-xl border border-[#e0d5c2] bg-[#fff8ed] p-4 text-sm dark:border-[#3c3347] dark:bg-[#292331]"
            >
              <div className="font-medium text-[#2b2116] dark:text-[#f6ede0]">
                Input
              </div>
              <pre className="mt-1 overflow-auto whitespace-pre-wrap text-[#5d5245] dark:text-[#d7ccbe]">
                {ex.input}
              </pre>

              <div className="mt-3 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                Output
              </div>
              <pre className="mt-1 overflow-auto whitespace-pre-wrap text-[#5d5245] dark:text-[#d7ccbe]">
                {ex.output}
              </pre>
            </div>
          ))}
        </div>
        <div>
          <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Hints</h3>
          <div className="mt-2 grid gap-3">
            {problem.hints.map((hint, i) => (
              <div key={i} className="rounded-lg border p-3  border-[#e0d5c2]  text-sm" onClick={() => toggleHint(i)}>
                  <span>
                    Hint {i+1}
                  </span>

                {openHints.includes(i) && (
                  <p className="mt-1 overflow-auto whitespace-pre-wrap text-[#5d5245] dark:text-[#d7ccbe]">{hint}</p>
                )}
              </div>
            ))}
            </div>
        </div>
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
      primary={<CodeEditor initialLanguage="javascript" initialCode={starterCode} onRun={handleRun} />}
      secondary={
        <div className="flex h-full flex-col rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
            Test Result
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-5 pt-3">
            {executionResults ? (
              <div className="space-y-3">
                {executionResults.results?.map((result, index) => (
                  <div key={index} className="rounded-lg border border-black/10 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        result.passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {result.time}ms • {result.memory}KB
                      </span>
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      <div><strong>Input:</strong> {result.input}</div>
                      <div><strong>Expected:</strong> {result.expected}</div>
                      <div><strong>Output:</strong> {result.output}</div>
                      {!result.passed && <div className="text-red-600 dark:text-red-400 mt-1">{result.error}</div>}
                    </div>
                  </div>
                ))}
                {executionResults.error && (
                  <div className="text-center text-sm text-red-600 dark:text-red-400">
                    {executionResults.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                You must run your code first.
              </div>
            )}
          </div>
        </div>
      }
    />
  );

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] px-4 py-3 dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="flex items-center gap-2">
          <Link
            href="/problems"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
          >
            Problems
          </Link>

          <button onClick={onPrev} disabled={!onPrev}>{"<"}</button>
          <button onClick={onNext} disabled={!onNext}>{">"}</button>

          <ProblemTimer running={timerRunning} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            title="Run (Ctrl + Enter)"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-white px-4 text-xs font-semibold text-[#5d5245] hover:bg-[#f6e9d2] disabled:opacity-50 cursor-pointer dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            title="Submit (Ctrl + Shift + Enter)"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#deceb7] bg-white px-4 text-xs font-semibold text-[#5d5245] hover:bg-[#f6e9d2] disabled:opacity-50 cursor-pointer dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
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
        />
      </div>

      <div className="grid gap-4 lg:hidden">
        {leftPanel}
        {rightPanel}
      </div>
    </section>
  );
}
