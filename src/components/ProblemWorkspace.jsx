"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";

export default function ProblemWorkspace({ problem, onNext, onPrev }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);

  const starterCode = useMemo(
    () =>
      `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code || starterCode,
          language,
        }),
      });
      const result = await response.json();
      setLastSubmissionStatus(`${result.status} in ${result.language}`);
    } catch {
      setLastSubmissionStatus("Execution Error");
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setTimerRunning(false); // ✅ stop timer on submit
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code: code || starterCode,
          status: "Accepted",
        }),
      });

      setLastSubmissionStatus(
        response.ok ? "Accepted" : "Wrong Answer"
      );
    } catch {
      setLastSubmissionStatus("Error");
    }

    setIsSubmitting(false);
  };

  /* ---------------- LEFT PANEL (UNCHANGED) ---------------- */
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
          <span className="inline-flex items-center rounded-full bg-[#edd9b8] px-4 py-2 text-xs font-semibold text-[#4b4033] dark:bg-[#f6ede0] dark:text-[#231406]">
            Description
          </span>
          <span className="inline-flex items-center rounded-full border border-[#deceb7] px-4 py-2 text-xs font-semibold text-[#8a7a67] dark:border-[#40364f] dark:text-[#b5a59c]">
            Editorial
          </span>
          <span className="inline-flex items-center rounded-full border border-[#deceb7] px-4 py-2 text-xs font-semibold text-[#8a7a67] dark:border-[#40364f] dark:text-[#b5a59c]">
            Solutions
          </span>
          <span className="inline-flex items-center rounded-full border border-[#deceb7] px-4 py-2 text-xs font-semibold text-[#8a7a67] dark:border-[#40364f] dark:text-[#b5a59c]">
            Submissions
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
              <pre className="mt-1 whitespace-pre-wrap">
                {ex.input}
              </pre>
              <div className="mt-3 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                Output
              </div>
              <pre className="mt-1 whitespace-pre-wrap">
                {ex.output}
              </pre>
            </div>
          ))}
        </div>
      </article>
    </div>
  );

  /* ---------------- RIGHT PANEL (UNCHANGED) ---------------- */
  const rightPanel = (
    <SplitPane
      direction="vertical"
      initialPrimary={680}
      minPrimary={260}
      minSecondary={220}
      storageKey={`algoryth.split.editor.${problem.slug}`}
      className="h-215 lg:h-full"
      primary={
        <CodeEditor
          initialLanguage={language}
          initialCode={code || starterCode}
          onChange={setCode}
          onLanguageChange={setLanguage}
        />
      }
      secondary={
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-[#fff8ed] dark:bg-[#211d27]">
          <div className="border-b px-4 py-2 text-xs font-semibold">
            Test Result
          </div>
          <div className="flex-1 overflow-auto px-4 pt-3 text-center text-sm">
            {lastSubmissionStatus || "You must run your code first."}
          </div>
        </div>
      }
    />
  );

  return (
    <section className="grid gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-[#fff8ed] px-4 py-3 dark:bg-[#211d27]">
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
          <button onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? "Running..." : "Run"}
          </button>
          <button onClick={handleSubmit} disabled={isRunning || isSubmitting}>
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
