"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";

export default function ProblemWorkspace({ problem }) {
  const [executionResults, setExecutionResults] = useState(null);
  const [openHints, setOpenHints] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    setLastSubmissionStatus(null);
    setInputError(null);
    setCode("");
    setTimerRunning(true);
  }, [problem.id]);

  const starterCode = useMemo(
    () => `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
    [problem.title]
  );

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  const handleRun = async () => {
    setIsRunning(true);
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
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: problem.slug,
          code,
          language,
          problemId: problem.id,
        }),
      });

      const data = await response.json();
      // Handle submit response, perhaps redirect or show message
      console.log('Submit response:', data);
    } catch (error) {
      console.error('Failed to submit code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHint = (i) => {
    setOpenHints((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const leftPanel = (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-[#fff8ed] px-5 py-5">
      <div className="border-b pb-4">
        <div className="text-xs">{problem.id}</div>
        <h1 className="text-xl font-semibold">{problem.title}</h1>
        <span className="mt-2 inline-block rounded border px-3 py-1 text-xs">
          {problem.difficulty}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm">{problem.statement}</p>

      <h3 className="mt-6 text-sm font-semibold">Constraints</h3>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {problem.constraints.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold">Examples</h3>
      <div className="mt-2 grid gap-3">
        {problem.examples.map((ex, i) => (
          <div key={i} className="rounded border p-3 text-sm">
            <div className="font-medium">Input</div>
            <pre>{ex.input}</pre>
            <div className="mt-2 font-medium">Output</div>
            <pre>{ex.output}</pre>
          </div>
        ))}
      </div>

      {problem.hints && (
        <>
          <h3 className="mt-6 text-sm font-semibold">Hints</h3>
          <div className="mt-2 grid gap-2">
            {problem.hints.map((hint, i) => (
              <div
                key={i}
                className="cursor-pointer rounded border p-2 text-sm"
                onClick={() => toggleHint(i)}
              >
                Hint {i + 1}
                {openHints.includes(i) && <p className="mt-1">{hint}</p>}
              </div>
            ))}
          </div>
        </>
      )}
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
      primary={<CodeEditor initialCode={code} initialLanguage={language} onChange={setCode} onLanguageChange={setLanguage} onRun={handleRun} onSubmit={handleSubmit} isRunning={isRunning} />}
      secondary={
        <div className="flex h-full flex-col rounded-2xl border">
          <div className="border-b px-4 py-2 text-xs font-semibold">
            Test Result
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-5 pt-3">
            {executionResults ? (
              <div className="space-y-3">
                {executionResults.testResults?.map((result, index) => (
                  <div key={index} className="rounded-lg border border-black/10 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        result.passed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {result.executionTime}ms
                      </span>
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      <div><strong>Input:</strong> {result.input}</div>
                      <div><strong>Expected:</strong> {result.expectedOutput}</div>
                      <div><strong>Output:</strong> {result.actualOutput}</div>
                      {!result.passed && result.error && <div className="text-red-600 dark:text-red-400 mt-1">{result.error}</div>}
                    </div>
                  </div>
                ))}
                {executionResults.error && (
                  <div className="text-center text-sm text-red-600 dark:text-red-400">
                    {executionResults.error}
                  </div>
                )}
                {executionResults.status && (
                  <div className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Status: {executionResults.status} ({executionResults.passedTests}/{executionResults.totalTests} tests passed)
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
      <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/problems">Problems</Link>
          <button onClick={onPrev} disabled={!onPrev}>
            {"<"}
          </button>
          <button onClick={onNext} disabled={!onNext}>
            {">"}
          </button>
          <ProblemTimer running={timerRunning} />
        </div>

        <div className="flex gap-2">
          <button onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? "Running..." : "Run"}
          </button>
          <button onClick={handleSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <SplitPane
        direction="horizontal"
        initialPrimary={760}
        minPrimary={420}
        minSecondary={420}
        primary={leftPanel}
        secondary={rightPanel}
      />
    </section>
  );
}
