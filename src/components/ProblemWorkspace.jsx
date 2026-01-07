"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";

export default function ProblemWorkspace({ problem }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);

  const starterCode = useMemo(
    () => `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code || starterCode,
          language
        })
      });
      const result = await response.json();
      setLastSubmissionStatus(`${result.status} in ${result.language}`);
    } catch {
      setLastSubmissionStatus("Execution Error");
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code: code || starterCode,
          status: 'Accepted' // Mock accepted
        })
      });
      if (response.ok) {
        setLastSubmissionStatus("Accepted");
      } else {
        setLastSubmissionStatus("Wrong Answer");
      }
    } catch {
      setLastSubmissionStatus("Error");
    }
    setIsSubmitting(false);
  };

  const leftPanel = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
      <div className="border-b border-black/10 bg-zinc-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {problem.id}
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              {problem.title}
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
            {problem.difficulty}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-black">
            Description
          </span>
          <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Editorial
          </span>
          <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Solutions
          </span>
          <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Submissions
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {problem.tags.map((t) => (
            <span
              key={`${problem.id}-${t}`}
              className="inline-flex items-center rounded-full border border-black/10 bg-black/3 px-3 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <article className="min-h-0 flex-1 overflow-auto px-5 py-5">
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
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-black/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold">
              <span className="rounded-full bg-black px-3 py-1 text-white dark:bg-white dark:text-black">
                Test Result
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">Testcase</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-5 pt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {lastSubmissionStatus || "You must run your code first."}
          </div>
        </div>
      }
    />
  );

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Link
            href="/problems"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-zinc-700 hover:bg-black/3 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Problems
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm text-zinc-700 hover:bg-black/3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            aria-label="Previous"
          >
            {"<"}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm text-zinc-700 hover:bg-black/3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            aria-label="Next"
          >
            {">"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
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
