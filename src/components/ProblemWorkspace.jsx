"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";
import { useEffect } from "react";
export default function ProblemWorkspace({ problem, onNext, onPrev }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [inputError, setInputError] = useState(null);
  const [customInput, setCustomInput] = useState("");


  useEffect(() => {
    setLastSubmissionStatus(null);
    setInputError(null);
    setCode("");
    setTimerRunning(true);
  }, [problem.id]);


  const starterCode = useMemo(
    () =>
      `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );


  const isCodeEmpty =
    !code || code.trim().length === 0 || code.trim() === starterCode.trim();

  const validateBeforeRun = () => {
    if (isCodeEmpty) {
      setInputError(
        "Please write some code before running. Starter code alone is not sufficient."
      );
      return false;
    }
    setInputError(null);
    return true;
  };


  const handleRun = async () => {
    if (!validateBeforeRun()) return;

    setIsRunning(true);
    setLastSubmissionStatus(null);

    try {
      const sampleInput = problem.examples?.[0]?.input ?? null;

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          input: sampleInput
            ? JSON.stringify(sampleInput)
            : undefined,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setLastSubmissionStatus(`Error:\n${result.error}`);
      } else {
        setLastSubmissionStatus(
          `Output:\n${result.result ?? result.output ?? "No output"}`
        );
      }
    } catch {
       setLastSubmissionStatus("Execution Error");
   }

    setIsRunning(false);
  };




  const handleSubmit = async () => {
  if (!validateBeforeRun()) return;

  setTimerRunning(false);
  setIsSubmitting(true);
  setLastSubmissionStatus(null);

  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: problem.slug, // ✅ correct
        code
      }),
    });

    const result = await response.json();
    setLastSubmissionStatus(result.verdict);
  } catch {
    setLastSubmissionStatus("Submission Error");
  }

  setIsSubmitting(false);
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
      primary={
        <CodeEditor
          initialLanguage={language}
          initialCode={code || starterCode}
          onChange={(val) => {
            setCode(val);
            setInputError(null);
          }}
          onLanguageChange={setLanguage}
          onRun={handleRun}
          onSubmit={handleSubmit}
          runDisabled={isRunning || isCodeEmpty}
          submitDisabled={isSubmitting || isCodeEmpty}
        />
      }
      secondary={
        <div className="flex h-full flex-col rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
            Test Result
          </div>

          <div className="flex-1 overflow-auto px-4 pt-4 text-center text-sm text-[#8a7a67] dark:text-[#b5a59c]">
            {inputError && (
              <div className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {inputError}
              </div>
            )}
    {/* RUN RESULTS */}
{Array.isArray(lastSubmissionStatus) ? (
  lastSubmissionStatus.map((t, i) => (
    <div
      key={i}
      className="mb-3 rounded border border-[#deceb7] bg-[#fff8ed] p-3 text-left dark:border-[#40364f] dark:bg-[#221d2b]"
    >
      <div><b>Input:</b> {t.input}</div>
      <div><b>Expected:</b> {t.expected}</div>
      <div>
        <b>Your Output:</b>{" "}
        {t.actual ?? <span className="text-red-600">{t.error}</span>}
      </div>
      <div
        className={
          t.passed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
        }
      >
        {t.passed ? "Passed" : "Failed"}
      </div>
    </div>
  ))
) : (
  lastSubmissionStatus || "You must run your code first."
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
