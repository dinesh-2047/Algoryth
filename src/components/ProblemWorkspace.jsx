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
  const [executionResult, setExecutionResult] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [inputError, setInputError] = useState(null);
  const [openHints, setOpenHints] = useState([]);

  const starterCode = useMemo(
    () => `// ${problem.title}\n\nfunction solve(input) {\n  // TODO\n}\n`,
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
    setExecutionResult(null);

    try {
      // Parse test cases from problem examples
      const testCases = problem.examples.map((ex) => ({
        input: ex.input,
        expectedOutput: ex.output,
      }));

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases,
          problemId: problem.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setExecutionResult({
          status: "Error",
          error: result.error || "Execution failed",
        });
      } else {
        setExecutionResult(result);
      }
    } catch (error) {
      setExecutionResult({
        status: "Error",
        error: "Network error: Could not connect to execution server",
      });
    }

    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!validateBeforeRun()) return;

    setTimerRunning(false);
    setIsSubmitting(true);
    setExecutionResult(null);

    try {
      // Parse test cases from problem examples
      const testCases = problem.examples.map((ex) => ({
        input: ex.input,
        expectedOutput: ex.output,
      }));

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases,
          problemId: problem.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setExecutionResult({
          status: "Error",
          error: result.error || "Submission failed",
        });
      } else {
        setExecutionResult({
          ...result,
          isSubmission: true,
        });
      }
    } catch (error) {
      setExecutionResult({
        status: "Error",
        error: "Network error: Could not connect to submission server",
      });
    }

    setIsSubmitting(false);
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
          onReset={() => {
            setCode(starterCode);
            setInputError(null);
          }}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
      }
      secondary={
        <div className="flex h-full flex-col rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
            Test Results
          </div>

          <div className="flex-1 overflow-auto px-4 py-4">
            {inputError && (
              <div className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {inputError}
              </div>
            )}

            {!executionResult && !inputError && (
              <div className="text-center text-sm text-[#8a7a67] dark:text-[#b5a59c]">
                Run your code to see test results
              </div>
            )}

            {executionResult && executionResult.status === "Error" && (
              <div className="rounded-lg bg-red-100 px-3 py-3 dark:bg-red-900/30">
                <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                  ❌ Execution Error
                </div>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600 dark:text-red-400">
                  {executionResult.error}
                </pre>
              </div>
            )}

            {executionResult && executionResult.status !== "Error" && (
              <div className="space-y-3">
                {/* Overall Status */}
                <div
                  className={`rounded-lg px-3 py-2 ${executionResult.status === "Accepted"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}
                >
                  <div
                    className={`text-sm font-semibold ${executionResult.status === "Accepted"
                        ? "text-green-700 dark:text-green-300"
                        : "text-yellow-700 dark:text-yellow-300"
                      }`}
                  >
                    {executionResult.status === "Accepted" ? "✅" : "⚠️"}{" "}
                    {executionResult.status}
                  </div>
                  {executionResult.testResults && (
                    <div className="mt-1 text-xs text-[#5d5245] dark:text-[#d7ccbe]">
                      {executionResult.passedTests} / {executionResult.totalTests} test cases passed
                    </div>
                  )}
                </div>

                {/* Individual Test Results */}
                {executionResult.testResults && executionResult.testResults.map((test, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border px-3 py-2 ${test.passed
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-xs font-semibold ${test.passed
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                          }`}
                      >
                        {test.passed ? "✓" : "✗"} Test Case {test.testCase}
                      </div>
                      {test.executionTime && (
                        <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                          {test.executionTime}ms
                        </div>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      <div>
                        <span className="font-medium text-[#5d5245] dark:text-[#d7ccbe]">
                          Input:
                        </span>
                        <pre className="mt-1 whitespace-pre-wrap text-[#8a7a67] dark:text-[#b5a59c]">
                          {test.input}
                        </pre>
                      </div>

                      <div>
                        <span className="font-medium text-[#5d5245] dark:text-[#d7ccbe]">
                          Expected:
                        </span>
                        <pre className="mt-1 whitespace-pre-wrap text-[#8a7a67] dark:text-[#b5a59c]">
                          {test.expectedOutput}
                        </pre>
                      </div>

                      <div>
                        <span className="font-medium text-[#5d5245] dark:text-[#d7ccbe]">
                          Your Output:
                        </span>
                        <pre
                          className={`mt-1 whitespace-pre-wrap ${test.passed
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            }`}
                        >
                          {test.actualOutput || "(no output)"}
                        </pre>
                      </div>

                      {test.error && (
                        <div>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            Error:
                          </span>
                          <pre className="mt-1 whitespace-pre-wrap text-xs text-red-600 dark:text-red-400">
                            {test.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Success message for submission */}
                {executionResult.isSubmission && executionResult.status === "Accepted" && (
                  <div className="mt-3 rounded-lg bg-green-100 px-3 py-2 text-center dark:bg-green-900/30">
                    <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                      🎉 Submission Accepted!
                    </div>
                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                      All test cases passed successfully
                    </div>
                  </div>
                )}
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
