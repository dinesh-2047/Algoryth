"use client";

import { useMemo, useState, useEffect } from "react";
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
  const [inputError, setInputError] = useState(null);
  const [openHints, setOpenHints] = useState([]);

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
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.error) {
        setLastSubmissionStatus(`Error:\n${result.error}`);
      } else {
        setLastSubmissionStatus(`Output:\n${result.output ?? "No output"}`);
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
          slug: problem.slug,
          code,
        }),
      });

      const result = await response.json();
      setLastSubmissionStatus(result.verdict);
    } catch {
      setLastSubmissionStatus("Submission Error");
    }

    setIsSubmitting(false);
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
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
      }
      secondary={
        <div className="flex h-full flex-col rounded-2xl border">
          <div className="border-b px-4 py-2 text-xs font-semibold">
            Test Result
          </div>
          <div className="flex-1 overflow-auto px-4 pt-4 text-sm">
            {inputError && (
              <div className="mb-3 rounded bg-red-100 px-3 py-2 text-red-700">
                {inputError}
              </div>
            )}
            {lastSubmissionStatus || "You must run your code first."}
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
