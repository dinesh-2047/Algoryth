"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";
import Visualizer from "./Visualizer";

export default function ProblemWorkspace({ problem, onNext, onPrev }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [inputError, setInputError] = useState(null);
  const [openHints, setOpenHints] = useState([]);
  // Playground state
  const [inputMode, setInputMode] = useState("raw"); // raw | array | matrix | graph
  const [rawInput, setRawInput] = useState("");
  const [arrayInput, setArrayInput] = useState(""); // comma-separated
  const [matrixInput, setMatrixInput] = useState(""); // rows by newline, comma-separated
  const [graphNodes, setGraphNodes] = useState("1,2,3");
  const [graphEdges, setGraphEdges] = useState("1-2,2-3"); // u-v pairs
  const [lastVisualization, setLastVisualization] = useState(null);

  const starterCode = useMemo(
    () => getStarterCode(language, problem.title),
    [language, problem.title]
  );

  const prevStarterRef = useRef(starterCode);

  // When language or problem changes, if user hasn't edited code, update starter
  useEffect(() => {
    const prev = prevStarterRef.current?.trim();
    const current = (code ?? "").trim();
    if (!current || current === prev) {
      setCode(starterCode);
    }
    prevStarterRef.current = starterCode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterCode]);

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

  // Build current input payload for executor and preview
  const buildCurrentInput = () => {
    if (inputMode === "array") {
      const arr = parseArrayInput(arrayInput);
      return { builtInput: arr, builtType: "array" };
    }
    if (inputMode === "matrix") {
      const mat = parseMatrixInput(matrixInput);
      return { builtInput: mat, builtType: "matrix" };
    }
    if (inputMode === "graph") {
      const nodes = graphNodes
        .split(/\s*,\s*/)
        .filter(Boolean)
        .map((label, idx) => ({ id: label, label }));
      const edges = graphEdges
        .split(/\s*,\s*/)
        .filter(Boolean)
        .map((pair) => {
          const [u, v] = pair.split(/\s*-\s*/);
          return { from: u, to: v };
        });
      return { builtInput: { nodes, edges }, builtType: "graph" };
    }
    return { builtInput: rawInput, builtType: "raw" };
  };

  const buildCurrentInputForPreview = () => {
    const { builtInput, builtType } = buildCurrentInput();
    if (builtType === "raw") {
      // try to parse JSON preview
      try {
        const parsed = JSON.parse(builtInput || "null");
        return { data: parsed, type: "auto" };
      } catch {
        return { data: builtInput, type: "json" };
      }
    }
    return { data: builtInput, type: builtType };
  };

  const handleRun = async () => {
    if (!validateBeforeRun()) return;

    setIsRunning(true);
    setLastSubmissionStatus(null);
    setLastVisualization(null);

    const { builtInput, builtType } = buildCurrentInput();

    try {
      // Parse test cases from problem examples
      const testCases = problem.examples.map((ex) => ({
        input: ex.input,
        expectedOutput: ex.output,
      }));

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, input: builtInput, inputType: builtType }),
      });

      const result = await response.json();
      setLastSubmissionStatus(`${result.status} in ${result.language}`);
      if (result.visualization) setLastVisualization(result.visualization);
    } catch {
      setLastSubmissionStatus("Execution Error");
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
        <div className="flex h-full flex-col gap-3">
          {/* Playground: Input Builder */}
          <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
            <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
              Playground Input
            </div>
            <div className="p-3 grid gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#5d5245] dark:text-[#d7ccbe]">Mode</label>
                <select
                  className="h-8 rounded-full border border-[#deceb7] bg-white px-3 text-xs font-semibold text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                  value={inputMode}
                  onChange={(e) => setInputMode(e.target.value)}
                >
                  <option value="raw">Raw</option>
                  <option value="array">Array</option>
                  <option value="matrix">Matrix</option>
                  <option value="graph">Graph</option>
                </select>

                {/* Sample from examples */}
                {problem.examples?.length > 0 && (
                  <select
                    className="h-8 rounded-full border border-[#deceb7] bg-white px-3 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      if (!Number.isNaN(idx)) setRawInput(problem.examples[idx].input || "");
                    }}
                  >
                    <option value="">Sample input…</option>
                    {problem.examples.map((ex, i) => (
                      <option key={i} value={i}>{`Example ${i + 1}`}</option>
                    ))}
                  </select>
                )}
              </div>

              {inputMode === "raw" && (
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-[#deceb7] bg-white p-2 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                  placeholder='Enter raw input (JSON supported). e.g., {"nums":[1,2,3],"target":4}'
                />
              )}

              {inputMode === "array" && (
                <input
                  type="text"
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  className="w-full rounded-md border border-[#deceb7] bg-white p-2 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                  placeholder="Comma-separated values, e.g., 1,2,3,4"
                />
              )}

              {inputMode === "matrix" && (
                <textarea
                  value={matrixInput}
                  onChange={(e) => setMatrixInput(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-[#deceb7] bg-white p-2 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                  placeholder="Rows on new lines, comma-separated per row. e.g.\n1,2,3\n4,5,6"
                />
              )}

              {inputMode === "graph" && (
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={graphNodes}
                    onChange={(e) => setGraphNodes(e.target.value)}
                    className="w-full rounded-md border border-[#deceb7] bg-white p-2 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                    placeholder="Nodes (comma-separated labels), e.g., 1,2,3,4"
                  />
                  <input
                    type="text"
                    value={graphEdges}
                    onChange={(e) => setGraphEdges(e.target.value)}
                    className="w-full rounded-md border border-[#deceb7] bg-white p-2 text-xs text-[#5d5245] outline-none dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
                    placeholder="Edges (u-v comma-separated), e.g., 1-2,2-3,3-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Test Result */}
          <div className="rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
            <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
              Test Result
            </div>
            <div className="overflow-auto px-4 pt-4 pb-4 text-center text-sm text-[#8a7a67] dark:text-[#b5a59c]">
              {inputError && (
                <div className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {inputError}
                </div>
              )}
              {lastSubmissionStatus || "You must run your code first."}
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid gap-3 md:grid-cols-2">
            <Visualizer title="Input Preview" {...buildCurrentInputForPreview()} />
            <Visualizer title="Output Visualization" data={lastVisualization?.data ?? (lastVisualization?.data || null)} type={lastVisualization?.type || "auto"} />
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

// Helpers
function getStarterCode(lang, title) {
  switch (lang) {
    case "python":
      return `# ${title}\n\nimport sys\n\n\ndef solve(data):\n    # TODO\n    pass\n\n\nif __name__ == "__main__":\n    # TODO: parse input if needed\n    pass\n`;
    case "java":
      return `// ${title}\n\nimport java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        // TODO\n    }\n}\n`;
    case "cpp":
      return `// ${title}\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO\n    return 0;\n}\n`;
    case "go":
      return `// ${title}\n\npackage main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main(){\n    in := bufio.NewReader(os.Stdin)\n    _ = in // TODO\n    fmt.Println()\n}\n`;
    case "javascript":
    default:
      return `// ${title}\n\nfunction solve(input) {\n  // TODO\n}\n`;
  }
}

function parseArrayInput(text) {
  if (!text.trim()) return [];
  return text
    .split(/\s*,\s*/)
    .filter((t) => t.length > 0)
    .map((t) => (isFinite(Number(t)) ? Number(t) : t));
}

function parseMatrixInput(text) {
  if (!text.trim()) return [];
  return text
    .split(/\n+/)
    .map((row) =>
      row
        .split(/\s*,\s*/)
        .filter((t) => t.length > 0)
        .map((t) => (isFinite(Number(t)) ? Number(t) : t))
    );
}

