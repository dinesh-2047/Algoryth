"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  List,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock3,
  HardDrive,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";
import Spinner from "./Spinner";
import BadgeNotification from "./BadgeNotification";
import { useAuth } from "../context/AuthContext";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const RUN_MEMORY_LIMIT_KB = 512 * 1024;

function normalizeOutput(output) {
  return String(output ?? "").replace(/\r\n/g, "\n").trim();
}

function outputsMatch(actualOutput, expectedOutput) {
  return normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);
}

function buildInitialExampleCases(examples = []) {
  const safeExamples = Array.isArray(examples) ? examples : [];

  if (safeExamples.length === 0) {
    return [
      {
        id: "case-1",
        label: "Case 1",
        input: "",
        expectedOutput: "",
        explanation: "",
        isCustom: false,
      },
    ];
  }

  return safeExamples.map((example, index) => ({
    id: `case-${index + 1}`,
    label: `Case ${index + 1}`,
    input: String(example.input || ""),
    expectedOutput: String(example.output || ""),
    explanation: String(example.explanation || ""),
    isCustom: false,
  }));
}

function classifyRunVerdict(payload, expectedOutput = "") {
  const errorText = String(payload?.error || payload?.details || "").toLowerCase();
  const exitCode = Number(payload?.exitCode);
  const signal = Number(payload?.signal);
  const executionTime = Number(payload?.executionTime || 0);
  const memoryUsage = Number(payload?.memoryUsage || 0);
  const output = String(payload?.output || "");

  if (exitCode === 124 || executionTime > 30000) {
    return "Time Limit Exceeded";
  }

  if ((exitCode === 137 && signal === 9) || memoryUsage > RUN_MEMORY_LIMIT_KB) {
    return "Memory Limit Exceeded";
  }

  if (
    errorText.includes("output limit") ||
    errorText.includes("too much output") ||
    output.length >= 999
  ) {
    return "Output Limit Exceeded";
  }

  if (
    errorText.includes("compile") ||
    errorText.includes("compilation") ||
    errorText.includes("syntax") ||
    errorText.includes("cannot find") ||
    errorText.includes("undeclared")
  ) {
    return "Compilation Error";
  }

  if (errorText.length > 0 || payload?.status === "error") {
    return "Runtime Error";
  }

  if (expectedOutput && !outputsMatch(payload?.output, expectedOutput)) {
    return "Wrong Answer";
  }

  if (expectedOutput) {
    return "Accepted";
  }

  return "Executed";
}

function getVerdictClasses(verdict) {
  if (verdict === "Accepted") {
    return "bg-[#44d07d] text-black dark:bg-[#173924] dark:text-[#fef08a]";
  }

  if (
    verdict === "Wrong Answer" ||
    verdict === "Runtime Error" ||
    verdict === "Compilation Error" ||
    verdict === "Time Limit Exceeded" ||
    verdict === "Memory Limit Exceeded" ||
    verdict === "Output Limit Exceeded"
  ) {
    return "bg-[#ff6b35] text-black dark:bg-[#4d2a25] dark:text-[#fff9f0]";
  }

  return "bg-[#0f92ff] text-black dark:bg-[#2f4064] dark:text-[#fff9f0]";
}

function getVerdictIcon(verdict) {
  if (verdict === "Accepted") return CheckCircle2;

  if (
    verdict === "Time Limit Exceeded" ||
    verdict === "Memory Limit Exceeded" ||
    verdict === "Output Limit Exceeded" ||
    verdict === "Runtime Error" ||
    verdict === "Compilation Error"
  ) {
    return AlertCircle;
  }

  return XCircle;
}

function toMonacoLanguage(language) {
  const normalized = String(language || "").toLowerCase();

  if (normalized === "javascript" || normalized === "js") return "javascript";
  if (normalized === "typescript" || normalized === "ts") return "typescript";
  if (normalized === "python" || normalized === "py") return "python";
  if (normalized === "java") return "java";
  if (
    normalized === "cpp" ||
    normalized === "c++" ||
    normalized === "c" ||
    normalized === "cc" ||
    normalized === "cxx"
  ) {
    return "cpp";
  }
  if (normalized === "go") return "go";
  if (normalized === "rust") return "rust";

  return "plaintext";
}

export default function ProblemWorkspace({ problem, onNext, onPrev, contestSlug }) {
  const router = useRouter();
  const { user, token, loading: authLoading, refreshUser } = useAuth();
  const [isWideLayout, setIsWideLayout] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultDetails, setResultDetails] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [inputError, setInputError] = useState(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [openHints, setOpenHints] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState("testcase");
  const [isResultPanelMinimized, setIsResultPanelMinimized] = useState(false);
  const [exampleCases, setExampleCases] = useState(() =>
    buildInitialExampleCases(problem.examples)
  );
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [removedCustomCase, setRemovedCustomCase] = useState(null);

  const handleDismissBadges = useCallback(() => setNewBadges([]), []);

  // Left tabs state
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null);
  const [submissionViewerTheme, setSubmissionViewerTheme] = useState("vs");
  const [copiedSubmissionKey, setCopiedSubmissionKey] = useState("");
  const [editorial, setEditorial] = useState(() => problem.editorial || {});
  const [editorialLoading, setEditorialLoading] = useState(false);
  const [editorialError, setEditorialError] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsError, setSolutionsError] = useState("");
  const [isPostingSolution, setIsPostingSolution] = useState(false);
  const [solutionDraft, setSolutionDraft] = useState({
    title: "",
    summary: "",
    code: "",
    language: "javascript",
  });

  useEffect(() => {
    setResultDetails(null);
    setInputError(null);
    setCode("");
    setLanguage("javascript");
    setTimerRunning(true);
    setActiveTab("Description");
    setIsTagsOpen(false);
    setOpenHints([]);
    setNewBadges([]);
    setActiveRightTab("testcase");
    setIsResultPanelMinimized(false);
    setExampleCases(buildInitialExampleCases(problem.examples));
    setActiveCaseIndex(0);
    setRemovedCustomCase(null);
    setSelectedSubmissionIndex(null);
    setCopiedSubmissionKey("");
    setEditorial(problem.editorial || {});
    setEditorialLoading(false);
    setEditorialError("");
    setSolutions([]);
    setSolutionsLoading(false);
    setSolutionsError("");
    setIsPostingSolution(false);
    setSolutionDraft({
      title: "",
      summary: "",
      code: "",
      language: "javascript",
    });

    const loadSubmissions = async () => {
      try {
        const token = localStorage.getItem("algoryth_token");
        if (token) {
          const response = await fetch(
            `/api/submissions/history?problemSlug=${problem.slug}&limit=20`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.submissions) {
              const normalized = data.submissions.map((submission) => ({
                id: submission._id || `${submission.submittedAt}-${submission.problemSlug}`,
                problemId: submission.problemId || problem.id,
                slug: submission.problemSlug || problem.slug,
                problemTitle: submission.problemTitle || problem.title,
                status: submission.verdict,
                verdict: submission.verdict,
                language: submission.language,
                code: submission.code || "",
                timestamp: submission.submittedAt || new Date().toISOString(),
                executionTime: Number(submission.executionTime || 0),
                memoryUsage: Number(submission.memoryUsage || 0),
                testsPassed: Number(submission.testsPassed || 0),
                totalTests: Number(submission.totalTests || 0),
                failedTestName: submission.failedTestName || null,
                failedTestIndex:
                  submission.failedTestIndex === null || submission.failedTestIndex === undefined
                    ? null
                    : Number(submission.failedTestIndex),
                errorMessage: submission.errorMessage || "",
                queueWaitMs: Number(submission.queueWaitMs || 0),
              }));

              setSubmissions(normalized);
              return;
            }
          }
        }

        const allSubmissions = JSON.parse(
          localStorage.getItem("algoryth_submissions") || "[]"
        );
        const validSubmissions = allSubmissions.filter(
          (submission) =>
            submission.problemId === problem.id || submission.slug === problem.slug
        );

        const normalizedFallback = validSubmissions
          .map((submission) => ({
            id:
              submission.id ||
              `${submission.timestamp || submission.submittedAt || Date.now()}-${
                submission.slug || problem.slug
              }`,
            problemId: submission.problemId || problem.id,
            slug: submission.slug || problem.slug,
            problemTitle: submission.problemTitle || problem.title,
            status: submission.status || submission.verdict || "Error",
            verdict: submission.verdict || submission.status || "Error",
            language: submission.language || "javascript",
            code: submission.code || "",
            timestamp:
              submission.timestamp || submission.submittedAt || new Date().toISOString(),
            executionTime: Number(submission.executionTime || 0),
            memoryUsage: Number(submission.memoryUsage || 0),
            testsPassed: Number(submission.testsPassed || 0),
            totalTests: Number(submission.totalTests || 0),
            failedTestName: submission.failedTestName || null,
            failedTestIndex:
              submission.failedTestIndex === null || submission.failedTestIndex === undefined
                ? null
                : Number(submission.failedTestIndex),
            errorMessage: submission.errorMessage || "",
            queueWaitMs: Number(submission.queueWaitMs || 0),
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setSubmissions(normalizedFallback);
      } catch (error) {
        console.error("Failed to load submissions", error);
      }
    };

    const authHeaders = () => {
      const headers = {};
      const persistedToken = localStorage.getItem("algoryth_token");
      if (persistedToken) {
        headers.Authorization = `Bearer ${persistedToken}`;
      }
      return headers;
    };

    const loadEditorial = async () => {
      try {
        setEditorialLoading(true);
        setEditorialError("");

        const response = await fetch(`/api/problems/${problem.slug}/editorial`, {
          headers: authHeaders(),
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load editorial");
        }

        const payload = await response.json();
        setEditorial(payload.editorial || {});
      } catch (error) {
        setEditorialError(error.message || "Failed to load editorial");
      } finally {
        setEditorialLoading(false);
      }
    };

    const loadSolutions = async () => {
      try {
        setSolutionsLoading(true);
        setSolutionsError("");

        const response = await fetch(`/api/problems/${problem.slug}/solutions`, {
          headers: authHeaders(),
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load solutions");
        }

        const payload = await response.json();
        setSolutions(Array.isArray(payload.solutions) ? payload.solutions : []);
      } catch (error) {
        setSolutionsError(error.message || "Failed to load solutions");
      } finally {
        setSolutionsLoading(false);
      }
    };

    loadSubmissions();
    loadEditorial();
    loadSolutions();
  }, [problem]);

  useEffect(() => {
    const updateLayout = () => {
      setIsWideLayout(window.innerWidth >= 768);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setSubmissionViewerTheme(isDark ? "vs-dark" : "vs");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (!localStorage.getItem("theme")) {
        updateTheme();
      }
    };

    mediaQuery?.addEventListener?.("change", handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.("change", handleSystemThemeChange);
    };
  }, []);

  // On mobile, when the result panel is minimized/restored, the code editor
  // container switches between a SplitPane (fixed height) and a flex layout.
  // Monaco doesn't detect this container resize on its own, so we dispatch a
  // window resize event to force it to recalculate its dimensions.
  useEffect(() => {
    if (isWideLayout) return; // only needed on mobile
    const id = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
    return () => clearTimeout(id);
  }, [isResultPanelMinimized, isWideLayout]);

  const starterCode = useMemo(
    () =>
      problem.starterCode?.[language] ||
      `// ${problem.title}\n\n// Write your solution and print the output.\n`,
    [problem, language]
  );

  const isCodeEmpty =
    !code || code.trim().length === 0 || code.trim() === starterCode.trim();

  const activeCase = useMemo(() => {
    if (exampleCases.length === 0) return null;
    const safeIndex = Math.min(activeCaseIndex, exampleCases.length - 1);
    return exampleCases[safeIndex];
  }, [exampleCases, activeCaseIndex]);

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

  const updateActiveCaseInput = (value) => {
    setExampleCases((prevCases) =>
      prevCases.map((testCase, index) =>
        index === activeCaseIndex ? { ...testCase, input: value } : testCase
      )
    );
  };

  const removeCaseAtIndex = (indexToRemove) => {
    const caseToRemove = exampleCases[indexToRemove];
    if (!caseToRemove?.isCustom) return;

    const nextCases = exampleCases
      .filter((_, index) => index !== indexToRemove)
      .map((testCase, index) => ({
        ...testCase,
        label: `Case ${index + 1}`,
      }));

    if (nextCases.length === 0) return;

    setExampleCases(nextCases);
    setRemovedCustomCase({
      caseData: caseToRemove,
      insertIndex: indexToRemove,
    });

    setActiveCaseIndex((prevIndex) => {
      if (prevIndex > indexToRemove) return prevIndex - 1;
      if (prevIndex === indexToRemove) return Math.max(0, indexToRemove - 1);
      return prevIndex;
    });
  };

  const restoreRemovedCase = () => {
    if (!removedCustomCase?.caseData) return;

    const safeInsertIndex = Math.min(
      Math.max(removedCustomCase.insertIndex, 0),
      exampleCases.length
    );

    const nextCases = [
      ...exampleCases.slice(0, safeInsertIndex),
      {
        ...removedCustomCase.caseData,
        isCustom: true,
      },
      ...exampleCases.slice(safeInsertIndex),
    ].map((testCase, index) => ({
      ...testCase,
      label: `Case ${index + 1}`,
    }));

    setExampleCases(nextCases);
    setActiveCaseIndex(safeInsertIndex);
    setRemovedCustomCase(null);
    setActiveRightTab("testcase");
  };

  const addCustomCase = () => {
    const nextIndex = exampleCases.length;
    const uniqueSuffix = Date.now();

    setExampleCases((prevCases) =>
      [
        ...prevCases,
        {
          id: `custom-case-${uniqueSuffix}`,
          label: `Case ${nextIndex + 1}`,
          input: "",
          expectedOutput: "",
          explanation: "",
          isCustom: true,
        },
      ].map((testCase, index) => ({
        ...testCase,
        label: `Case ${index + 1}`,
      }))
    );

    setActiveCaseIndex(nextIndex);
    setRemovedCustomCase(null);
    setActiveRightTab("testcase");
  };

  const handleRun = async () => {
    if (!validateBeforeRun()) return;

    setIsRunning(true);
    setResultDetails(null);
    setInputError(null);
    setActiveRightTab("result");
    setIsResultPanelMinimized(false);

    const runInput = activeCase?.input || "";
    const expectedOutput = activeCase?.expectedOutput || "";

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          input: runInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || result.details || "Unknown execution error";
        const verdict = classifyRunVerdict(
          {
            ...result,
            output: "",
            error: errorMessage,
            status: "error",
          },
          expectedOutput
        );

        setResultDetails({
          kind: "run",
          verdict,
          caseLabel: activeCase?.label || "Case",
          caseIndex: activeCaseIndex + 1,
          input: runInput,
          expectedOutput,
          output: "",
          error: errorMessage,
          executionTime: Number(result.executionTime || 0),
          memoryUsage: Number(result.memoryUsage || 0),
          queueWaitMs: Number(result.queueWaitMs || 0),
          checkedAgainstExample: Boolean(expectedOutput.trim()),
          outputMatchesExample: false,
        });
        return;
      }

      const verdict = classifyRunVerdict(result, expectedOutput);
      const checkedAgainstExample = Boolean(expectedOutput.trim());
      const outputMatchesExample = checkedAgainstExample
        ? outputsMatch(result.output, expectedOutput)
        : null;

      setResultDetails({
        kind: "run",
        verdict,
        caseLabel: activeCase?.label || "Case",
        caseIndex: activeCaseIndex + 1,
        input: runInput,
        expectedOutput,
        output: String(result.output || ""),
        error: String(result.error || ""),
        executionTime: Number(result.executionTime || 0),
        memoryUsage: Number(result.memoryUsage || 0),
        queueWaitMs: Number(result.queueWaitMs || 0),
        checkedAgainstExample,
        outputMatchesExample,
      });
    } catch (error) {
      setResultDetails({
        kind: "run",
        verdict: "Runtime Error",
        caseLabel: activeCase?.label || "Case",
        caseIndex: activeCaseIndex + 1,
        input: runInput,
        expectedOutput,
        output: "",
        error: `Execution Error: ${error.message}`,
        executionTime: 0,
        memoryUsage: 0,
        queueWaitMs: 0,
        checkedAgainstExample: Boolean(expectedOutput.trim()),
        outputMatchesExample: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateBeforeRun()) return;

    if (authLoading) return;

    if (!user || !token) {
      setResultDetails({
        kind: "submit",
        verdict: "Error",
        testsPassed: 0,
        totalTests: 0,
        executionTime: 0,
        memoryUsage: 0,
        queueWaitMs: 0,
        failedCase: null,
        errorMessage: "Please login first. Redirecting to login...",
      });
      setActiveRightTab("result");
      setIsResultPanelMinimized(false);
      router.push(`/auth?redirect=${encodeURIComponent(`/problems/${problem.slug}`)}`);
      return;
    }

    setTimerRunning(false);
    setIsSubmitting(true);
    setResultDetails(null);
    setInputError(null);
    setNewBadges([]);
    setActiveRightTab("result");
    setIsResultPanelMinimized(false);

    let verdict = "Submission Error";
    let responsePayload = null;

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: problem.slug,
          code,
          language,
          contestSlug,
        }),
      });

      responsePayload = await response.json();

      if (!response.ok) {
        verdict =
          responsePayload.verdict ||
          responsePayload.message ||
          responsePayload.error ||
          "Error";

        setResultDetails({
          kind: "submit",
          verdict,
          testsPassed: Number(responsePayload.testsPassed || 0),
          totalTests: Number(responsePayload.totalTests || 0),
          executionTime: Number(responsePayload.executionTime || 0),
          memoryUsage: Number(responsePayload.memoryUsage || 0),
          queueWaitMs: Number(responsePayload.queueWaitMs || 0),
          failedCase: responsePayload.failedCase || null,
          errorMessage:
            responsePayload.details ||
            responsePayload.message ||
            responsePayload.error ||
            "Submission failed",
        });
      } else {
        verdict = responsePayload.verdict || "Unknown";

        setResultDetails({
          kind: "submit",
          verdict,
          testsPassed: Number(responsePayload.testsPassed || 0),
          totalTests: Number(responsePayload.totalTests || 0),
          executionTime: Number(responsePayload.executionTime || 0),
          memoryUsage: Number(responsePayload.memoryUsage || 0),
          queueWaitMs: Number(responsePayload.queueWaitMs || 0),
          failedCase: responsePayload.failedCase || null,
          errorMessage:
            responsePayload.details || responsePayload.failedCase?.reason || "",
        });

        if (responsePayload.newBadges?.length > 0) {
          setNewBadges(responsePayload.newBadges);
        }
      }
    } catch (error) {
      verdict = "Network Error";

      setResultDetails({
        kind: "submit",
        verdict,
        testsPassed: 0,
        totalTests: 0,
        executionTime: 0,
        memoryUsage: 0,
        queueWaitMs: 0,
        failedCase: null,
        errorMessage: error.message,
      });
    }

    const newSubmission = {
      id: `${Date.now()}-${problem.slug}`,
      problemId: problem.id,
      slug: problem.slug,
      problemTitle: problem.title,
      status: verdict,
      verdict,
      language,
      code,
      timestamp: new Date().toISOString(),
      executionTime: Number(responsePayload?.executionTime || 0),
      memoryUsage: Number(responsePayload?.memoryUsage || 0),
      testsPassed: Number(responsePayload?.testsPassed || 0),
      totalTests: Number(responsePayload?.totalTests || 0),
      failedTestName: responsePayload?.failedCase?.name || null,
      failedTestIndex:
        responsePayload?.failedCase?.index === undefined ||
        responsePayload?.failedCase?.index === null
          ? null
          : Number(responsePayload.failedCase.index),
      errorMessage:
        responsePayload?.details ||
        responsePayload?.failedCase?.reason ||
        responsePayload?.message ||
        "",
      queueWaitMs: Number(responsePayload?.queueWaitMs || 0),
    };

    setSubmissions((prevSubmissions) => [newSubmission, ...prevSubmissions]);
    setSelectedSubmissionIndex(0);

    try {
      const allSubmissions = JSON.parse(
        localStorage.getItem("algoryth_submissions") || "[]"
      );
      localStorage.setItem(
        "algoryth_submissions",
        JSON.stringify([newSubmission, ...allSubmissions])
      );
    } catch (error) {
      console.error("Failed to save submission to localStorage backup:", error);
    }

    setIsSubmitting(false);

    if (token) {
      await refreshUser(token);
    }

    setActiveTab("Submissions");
  };

  const toggleHint = (index) => {
    setOpenHints((prevHints) =>
      prevHints.includes(index)
        ? prevHints.filter((hintIndex) => hintIndex !== index)
        : [...prevHints, index]
    );
  };

  const toggleTags = () => {
    setIsTagsOpen((prevOpen) => !prevOpen);
  };

  const copySubmissionCode = async (submission, index) => {
    const codeToCopy = String(submission?.code || "");
    if (!codeToCopy) return;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      const key = String(submission?.id || `${submission?.timestamp || "submission"}-${index}`);
      setCopiedSubmissionKey(key);
      setTimeout(() => setCopiedSubmissionKey(""), 1400);
    } catch (error) {
      console.error("Failed to copy submission code:", error);
    }
  };

  const handlePostSolution = async () => {
    if (authLoading) return;

    if (!user || !token) {
      router.push(`/auth?redirect=${encodeURIComponent(`/problems/${problem.slug}`)}`);
      return;
    }

    const title = String(solutionDraft.title || "").trim();
    const codeToSubmit = String(solutionDraft.code || code || "").trim();

    if (!title || !codeToSubmit) {
      setSolutionsError("Solution title and code are required.");
      return;
    }

    try {
      setIsPostingSolution(true);
      setSolutionsError("");

      const response = await fetch(`/api/problems/${problem.slug}/solutions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          summary: solutionDraft.summary || "",
          code: codeToSubmit,
          language: solutionDraft.language || language,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to post solution");
      }

      if (payload.solution) {
        setSolutions((prev) => [payload.solution, ...prev]);
      }

      setSolutionDraft({
        title: "",
        summary: "",
        code: codeToSubmit,
        language: solutionDraft.language || language,
      });
    } catch (error) {
      setSolutionsError(error.message || "Failed to post solution");
    } finally {
      setIsPostingSolution(false);
    }
  };

  const handleDeleteSolution = async (solutionId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `/api/problems/${problem.slug}/solutions/${solutionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to remove solution");
      }

      setSolutions((prev) => prev.filter((item) => item.id !== solutionId));
    } catch (error) {
      setSolutionsError(error.message || "Failed to remove solution");
    }
  };

  const tabs = [
    { id: "Description", icon: FileText, label: "Description", shortLabel: "Desc" },
    { id: "Editorial", icon: BookOpen, label: "Editorial", shortLabel: "Edit" },
    { id: "Solutions", icon: List, label: "Solutions", shortLabel: "Sol" },
    { id: "Submissions", icon: History, label: "Submissions", shortLabel: "Subs" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2b2116] dark:text-[#f6ede0]">
              {problem.statement}
            </p>

            {problem.inputFormat && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  Input Format
                </h3>
                <pre className="mt-2 overflow-x-auto rounded bg-[#f7f0e0] p-3 text-xs text-[#5d5245] dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                  {problem.inputFormat}
                </pre>
              </>
            )}

            {problem.outputFormat && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  Output Format
                </h3>
                <pre className="mt-2 overflow-x-auto rounded bg-[#f7f0e0] p-3 text-xs text-[#5d5245] dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                  {problem.outputFormat}
                </pre>
              </>
            )}

            <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
              Constraints
            </h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
              {(problem.constraints || []).map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
              Examples
            </h3>
            <div className="mt-2 grid gap-3">
              {(problem.examples || []).map((example, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#e0d5c2] bg-white p-3 text-sm dark:border-[#3c3347] dark:bg-[#211d27]"
                >
                  <div className="font-medium text-[#2b2116] dark:text-[#f6ede0]">Input</div>
                  <pre className="mt-1 overflow-x-auto rounded bg-[#f7f0e0] p-2 font-mono text-xs dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                    {example.input}
                  </pre>
                  <div className="mt-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">Output</div>
                  <pre className="mt-1 overflow-x-auto rounded bg-[#f7f0e0] p-2 font-mono text-xs dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                    {example.output}
                  </pre>
                  {example.explanation && (
                    <>
                      <div className="mt-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                        Explanation
                      </div>
                      <p className="mt-1 text-xs text-[#5d5245] dark:text-[#d7ccbe]">
                        {example.explanation}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {Array.isArray(problem.tags) && problem.tags.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  Tags
                </h3>
                <div className="mt-2 grid gap-2">
                  <div
                    className="cursor-pointer rounded border border-[#e0d5c2] p-2 text-sm transition-colors hover:bg-[#fff8ed] dark:border-[#3c3347] dark:hover:bg-[#2d2535]"
                    onClick={toggleTags}
                  >
                    <div className="flex items-center gap-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                      <span>Tags</span>
                    </div>
                    {isTagsOpen && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#e0d5c2] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {Array.isArray(problem.hints) && problem.hints.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  Hints
                </h3>
                <div className="mt-2 grid gap-2">
                  {problem.hints.map((hint, index) => (
                    <div
                      key={index}
                      className="cursor-pointer rounded border border-[#e0d5c2] p-2 text-sm transition-colors hover:bg-[#fff8ed] dark:border-[#3c3347] dark:hover:bg-[#2d2535]"
                      onClick={() => toggleHint(index)}
                    >
                      <div className="flex items-center gap-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                        <span>Hint {index + 1}</span>
                      </div>
                      {openHints.includes(index) && (
                        <p className="mt-2 text-[#5d5245] dark:text-[#d7ccbe]">{hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case "Editorial":
        return (
          <div className="space-y-4">
            {editorialLoading ? (
              <div className="rounded-lg border border-[#e0d5c2] bg-white p-4 text-sm text-[#5d5245] dark:border-[#3c3347] dark:bg-[#211d27] dark:text-[#d7ccbe]">
                Loading editorial...
              </div>
            ) : editorialError ? (
              <div className="rounded-lg border border-[#e0d5c2] bg-[#fff0ea] p-4 text-sm text-[#5d5245] dark:border-[#3c3347] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                {editorialError}
              </div>
            ) : editorial?.content ? (
              <div className="rounded-lg border border-[#e0d5c2] bg-white p-4 dark:border-[#3c3347] dark:bg-[#211d27]">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#2b2116] dark:text-[#f6ede0]">
                  {editorial.title || `${problem.title} Editorial`}
                </h3>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#5d5245] dark:text-[#d7ccbe]">
                  {editorial.content}
                </pre>
                {editorial.updatedAt && (
                  <p className="mt-3 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                    Updated {new Date(editorial.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 rounded-full bg-[#f2e3cc] p-4 dark:bg-[#292331]">
                  <BookOpen className="h-8 w-8 text-[#d69a44] dark:text-[#f2c66f]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                  No Editorial Yet
                </h3>
                <p className="mt-2 max-w-xs text-sm text-[#5d5245] dark:text-[#d7ccbe]">
                  An admin can add editorial content from the admin dashboard.
                </p>
              </div>
            )}
          </div>
        );

      case "Solutions":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">
                Community Solutions
              </h3>
              <span className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                {solutions.length} posted
              </span>
            </div>

            {user ? (
              <div className="rounded-lg border border-[#e0d5c2] bg-white p-4 dark:border-[#3c3347] dark:bg-[#211d27]">
                <h4 className="text-sm font-black uppercase tracking-wide text-[#2b2116] dark:text-[#f6ede0]">
                  Post Your Solution
                </h4>
                <div className="mt-3 grid gap-3">
                  <input
                    value={solutionDraft.title}
                    onChange={(event) =>
                      setSolutionDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Solution title"
                    className="rounded-lg border border-[#e0d5c2] bg-[#fff9d0] px-3 py-2 text-sm text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]"
                  />
                  <textarea
                    value={solutionDraft.summary}
                    onChange={(event) =>
                      setSolutionDraft((prev) => ({ ...prev, summary: event.target.value }))
                    }
                    placeholder="Short explanation of your approach"
                    className="h-20 resize-none rounded-lg border border-[#e0d5c2] bg-[#fff9d0] px-3 py-2 text-sm text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]"
                  />
                  <textarea
                    value={solutionDraft.code}
                    onChange={(event) =>
                      setSolutionDraft((prev) => ({ ...prev, code: event.target.value }))
                    }
                    placeholder="Paste solution code here"
                    className="h-40 resize-y rounded-lg border border-[#e0d5c2] bg-[#fff9d0] px-3 py-2 font-mono text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={solutionDraft.language}
                      onChange={(event) =>
                        setSolutionDraft((prev) => ({
                          ...prev,
                          language: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-[#e0d5c2] bg-[#fff9d0] px-3 py-2 text-sm text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                    </select>
                    <button
                      onClick={handlePostSolution}
                      disabled={isPostingSolution}
                      className="rounded-lg bg-[#0f92ff] px-3 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:bg-[#fef08a]"
                    >
                      {isPostingSolution ? "Posting..." : "Post Solution"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#e0d5c2] bg-white p-4 text-xs text-[#5d5245] dark:border-[#3c3347] dark:bg-[#211d27] dark:text-[#d7ccbe]">
                Login to post your own solution.
              </div>
            )}

            {solutionsError && (
              <div className="rounded-lg border border-[#e0d5c2] bg-[#fff0ea] p-3 text-xs text-[#5d5245] dark:border-[#3c3347] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                {solutionsError}
              </div>
            )}

            {solutionsLoading ? (
              <div className="rounded-lg border border-[#e0d5c2] bg-white p-4 text-sm text-[#5d5245] dark:border-[#3c3347] dark:bg-[#211d27] dark:text-[#d7ccbe]">
                Loading community solutions...
              </div>
            ) : solutions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#e0d5c2] bg-white p-5 text-sm text-[#5d5245] dark:border-[#3c3347] dark:bg-[#211d27] dark:text-[#d7ccbe]">
                No solutions posted yet. Be the first to share one.
              </div>
            ) : (
              solutions.map((entry) => {
                const canDelete = Boolean(
                  user &&
                    (String(entry.userId) === String(user.id) || user.role === "admin")
                );

                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-[#e0d5c2] bg-white p-4 transition-all hover:shadow-sm dark:border-[#3c3347] dark:bg-[#211d27]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-[#2b2116] dark:text-[#f6ede0]">
                          {entry.title}
                        </h4>
                        <div className="mt-1 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                          {entry.authorName}  {entry.language}
                          {entry.runtimeMs !== null && entry.runtimeMs !== undefined
                            ? `  ${entry.runtimeMs}ms`
                            : ""}
                          {entry.memoryKb !== null && entry.memoryKb !== undefined
                            ? `  ${entry.memoryKb}KB`
                            : ""}
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteSolution(entry.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#ff6b35] px-2 py-1 text-[11px] font-black uppercase tracking-wide text-black dark:bg-[#4d2a25] dark:text-[#fff9f0]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    {entry.summary && (
                      <p className="mt-2 text-xs text-[#5d5245] dark:text-[#d7ccbe]">
                        {entry.summary}
                      </p>
                    )}

                    <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-[#fff9d0] p-3 text-xs text-black dark:bg-[#151525] dark:text-[#fff9f0]">
                      {entry.code}
                    </pre>

                    <div className="mt-2 text-[11px] text-[#8a7a67] dark:text-[#b5a59c]">
                      Posted {new Date(entry.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case "Submissions": {
        const selectedSubmission =
          selectedSubmissionIndex !== null ? submissions[selectedSubmissionIndex] : null;
        const selectedVerdict =
          selectedSubmission?.status || selectedSubmission?.verdict || "Error";
        const selectedKey = selectedSubmission
          ? String(
              selectedSubmission.id ||
                `${selectedSubmission.timestamp || "submission"}-${selectedSubmissionIndex}`
            )
          : "";

        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">Your Submissions</h3>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e0d5c2] py-10 text-center dark:border-[#3c3347]">
                <History className="mb-2 h-8 w-8 text-[#b5a08a] dark:text-[#7f748a]" />
                <p className="text-sm text-[#5d5245] dark:text-[#d7ccbe]">No submissions yet</p>
                <button
                  onClick={() => setActiveTab("Description")}
                  className="mt-2 text-xs font-semibold text-[#d69a44] hover:underline dark:text-[#f2c66f]"
                >
                  Start solving
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {submissions.map((submission, index) => {
                    const verdict = submission.status || submission.verdict || "Error";
                    const isSelected = selectedSubmissionIndex === index;
                    const VerdictIcon = getVerdictIcon(verdict);

                    return (
                      <div
                        key={submission.id || `${submission.timestamp}-${index}`}
                        className="rounded-lg border border-[#e0d5c2] bg-white p-3 text-sm dark:border-[#3c3347] dark:bg-[#211d27]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <VerdictIcon className="h-5 w-5 text-black dark:text-[#fef08a]" />
                            <div>
                              <div
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-black uppercase tracking-wide ${getVerdictClasses(
                                  verdict
                                )}`}
                              >
                                {verdict}
                              </div>
                              <div className="mt-1 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                                {new Date(submission.timestamp).toLocaleString()} {"  "}
                                {submission.language}
                              </div>
                              <div className="mt-1 text-xs text-[#5d5245] dark:text-[#d7ccbe]">
                                Passed {submission.testsPassed || 0}/
                                {submission.totalTests || 0} tests
                                {submission.executionTime
                                  ? `  ${submission.executionTime} ms`
                                  : ""}
                                {submission.memoryUsage ? `  ${submission.memoryUsage} KB` : ""}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedSubmissionIndex((prevIndex) =>
                                prevIndex === index ? null : index
                              )
                            }
                            aria-label="View submission details"
                            title="View submission details"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/20 transition-colors dark:border-[#7d8fc4]/35 ${
                              isSelected
                                ? "bg-[#0f92ff] text-black dark:bg-[#fef08a]"
                                : "bg-white text-black hover:bg-[#44d07d] dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2d3f62]"
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSubmission ? (
                  <div className="rounded-lg border-2 border-black bg-[#fff9d0] p-3 dark:border-[#fef08a] dark:bg-[#151525] sm:p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${getVerdictClasses(
                            selectedVerdict
                          )}`}
                        >
                          {selectedVerdict}
                        </div>
                        <div className="mt-1 text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                          {new Date(selectedSubmission.timestamp).toLocaleString()} {" • "}
                          {selectedSubmission.language}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copySubmissionCode(selectedSubmission, selectedSubmissionIndex)
                        }
                        aria-label="Copy submitted code"
                        title="Copy code"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/20 bg-white text-black transition-colors hover:bg-[#fff4a3] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#eef3ff] dark:hover:bg-[#2f4064]"
                      >
                        {copiedSubmissionKey === selectedKey ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                        <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">
                          Runtime
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-black text-black dark:text-[#eef3ff]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {selectedSubmission.executionTime > 0
                            ? `${selectedSubmission.executionTime} ms`
                            : "Recorded"}
                        </div>
                      </div>

                      <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                        <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">
                          Memory
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-black text-black dark:text-[#eef3ff]">
                          <HardDrive className="h-3.5 w-3.5" />
                          {selectedSubmission.memoryUsage > 0
                            ? `${selectedSubmission.memoryUsage} KB`
                            : "-"}
                        </div>
                      </div>

                      <div className="rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                        <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#9baed8]">
                          Tests
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-black text-black dark:text-[#eef3ff]">
                          <Code2 className="h-3.5 w-3.5" />
                          {selectedSubmission.testsPassed || 0}/
                          {selectedSubmission.totalTests || 0}
                        </div>
                      </div>
                    </div>

                    {selectedSubmission.errorMessage && (
                      <div className="mt-3 rounded bg-[#ffddd3] px-2.5 py-2 text-xs font-semibold text-black dark:bg-[#3f2320] dark:text-[#fff9f0]">
                        {selectedSubmission.errorMessage}
                      </div>
                    )}

                    {(selectedSubmission.failedTestName ||
                      selectedSubmission.failedTestIndex !== null) && (
                      <div className="mt-3 rounded border border-black/20 bg-white px-2.5 py-2 text-xs font-semibold text-[#5d5245] dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#d7ccbe]">
                        Failed testcase
                        {selectedSubmission.failedTestIndex !== null &&
                        selectedSubmission.failedTestIndex !== undefined
                          ? ` #${selectedSubmission.failedTestIndex}`
                          : ""}
                        {selectedSubmission.failedTestName
                          ? `: ${selectedSubmission.failedTestName}`
                          : ""}
                      </div>
                    )}

                    <div className="mt-3 rounded-lg border border-black/20 bg-white p-2.5 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                      <div className="mb-2 text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
                        Submitted Code ({selectedSubmission.language})
                      </div>
                      <div className="h-72 min-h-64 overflow-hidden rounded-md border border-black/15 dark:border-[#7d8fc4]/30">
                        <Monaco
                          height="100%"
                          theme={submissionViewerTheme}
                          language={toMonacoLanguage(selectedSubmission.language)}
                          value={
                            selectedSubmission.code ||
                            "// Code not available for this submission."
                          }
                          options={{
                            readOnly: true,
                            domReadOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            lineNumbers: "on",
                            smoothScrolling: true,
                            renderLineHighlight: "line",
                            automaticLayout: true,
                            padding: { top: 10, bottom: 10 },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#e0d5c2] bg-white p-4 text-xs text-[#5d5245] dark:border-[#3c3347] dark:bg-[#211d27] dark:text-[#d7ccbe]">
                    Select a submission using the eye icon to view full details here.
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };
  const renderResultPanel = () => {
    if (!resultDetails && !inputError) {
      return (
        <div className="text-[#8a7a67] dark:text-[#b5a59c] italic">
          Run code or submit to see detailed results here.
        </div>
      );
    }

    return (
      <div className="space-y-3 code-font">
        {inputError && (
          <div className="rounded bg-rose-100 px-3 py-2 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            {inputError}
          </div>
        )}

        {resultDetails && (
          <>
            <div
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getVerdictClasses(
                resultDetails.verdict
              )}`}
            >
              {resultDetails.verdict}
            </div>

            {resultDetails.kind === "run" && (
              <>
                <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-[#2b2116] dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#f6ede0]">
                  Running {resultDetails.caseLabel} with selected input.
                  {resultDetails.checkedAgainstExample
                    ? ` Expected-output check: ${
                        resultDetails.outputMatchesExample ? "Matched" : "Not matched"
                      }.`
                    : " No expected output configured for this case."}
                </div>

                {resultDetails.error ? (
                  <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    <div className="mb-1 font-black uppercase">Error</div>
                    <pre className="whitespace-pre-wrap">{resultDetails.error}</pre>
                  </div>
                ) : (
                  <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    <div className="mb-1 font-black uppercase">Output</div>
                    <pre className="whitespace-pre-wrap">{resultDetails.output || "<empty>"}</pre>
                  </div>
                )}

                {resultDetails.checkedAgainstExample && (
                  <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    <div className="mb-1 font-black uppercase">Expected Output</div>
                    <pre className="whitespace-pre-wrap">
                      {resultDetails.expectedOutput || "<empty>"}
                    </pre>
                  </div>
                )}
              </>
            )}

            {resultDetails.kind === "submit" && (
              <>
                <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                  <div className="font-black uppercase">Passed Tests</div>
                  <div className="mt-1">
                    {resultDetails.testsPassed || 0}/{resultDetails.totalTests || 0}
                  </div>
                </div>

                {resultDetails.failedCase && (
                  <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    <div className="font-black uppercase">Failed Test Case</div>
                    <div className="mt-1">
                      #{resultDetails.failedCase.index} ({resultDetails.failedCase.name})
                    </div>
                    {resultDetails.failedCase.reason && (
                      <div className="mt-1">Reason: {resultDetails.failedCase.reason}</div>
                    )}
                    {resultDetails.failedCase.expectedOutput !== undefined && (
                      <div className="mt-2">
                        <div className="font-black uppercase">Expected</div>
                        <pre className="whitespace-pre-wrap">
                          {resultDetails.failedCase.expectedOutput}
                        </pre>
                      </div>
                    )}
                    {resultDetails.failedCase.actualOutput !== undefined && (
                      <div className="mt-2">
                        <div className="font-black uppercase">Actual</div>
                        <pre className="whitespace-pre-wrap">
                          {resultDetails.failedCase.actualOutput || "<empty>"}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {resultDetails.errorMessage && (
                  <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    <div className="font-black uppercase">Details</div>
                    <pre className="mt-1 whitespace-pre-wrap">{resultDetails.errorMessage}</pre>
                  </div>
                )}
              </>
            )}

            <div className="rounded border border-[#e0d5c2] bg-white p-3 text-xs text-[#2b2116] dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#f6ede0]">
              <div>
                Time: {resultDetails.executionTime || 0} ms
                {" • "}
                Memory: {resultDetails.memoryUsage || 0} KB
                {" • "}
                Queue Wait: {resultDetails.queueWaitMs || 0} ms
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const leftPanel = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#fff9d0] shadow-[2px_2px_0_0_#000] dark:border-[#fef08a] dark:bg-[#202037] dark:shadow-[2px_2px_0_0_#a9b9db]">
      <div className="border-b-2 border-black bg-[#ff6b35] px-5 py-4 dark:border-[#fef08a] dark:bg-[#2f2f4a]">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
              {problem.id}
            </div>
            <h1 className="truncate text-lg font-black uppercase text-black sm:text-xl dark:text-[#fff9f0]">
              {problem.title}
            </h1>
          </div>
          <span
            className={`shrink-0 rounded-full border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-wide sm:px-3 sm:text-xs dark:border-[#fef08a] ${
              (
                problem.difficulty ||
                (problem.rating < 1300
                  ? "Easy"
                  : problem.rating < 1900
                    ? "Medium"
                    : "Hard")
              ) === "Easy"
                ? "bg-[#44d07d] text-black dark:bg-[#173924] dark:text-[#fef08a]"
                : (
                      problem.difficulty ||
                      (problem.rating < 1300
                        ? "Easy"
                        : problem.rating < 1900
                          ? "Medium"
                          : "Hard")
                    ) === "Medium"
                  ? "bg-[#0f92ff] text-black dark:bg-[#1c3653] dark:text-[#fff9f0]"
                  : "bg-[#ff6b35] text-black dark:bg-[#4d2a25] dark:text-[#fff9f0]"
            }`}
          >
            {problem.difficulty ||
              (problem.rating < 1300
                ? "Easy"
                : problem.rating < 1900
                  ? "Medium"
                  : "Hard")}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg border border-black bg-[#fff9d0] p-1 dark:border-[#fef08a] dark:bg-[#151525]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-1 py-1 text-[10px] font-black uppercase tracking-wide transition-all sm:gap-2 sm:py-1.5 sm:text-xs ${
                  isActive
                    ? "bg-[#0f92ff] text-black dark:bg-[#fef08a]"
                    : "bg-transparent text-black hover:bg-[#44d07d] dark:text-[#fff9f0] dark:hover:bg-[#263f3a]"
                }`}
              >
                <Icon className="hidden h-3.5 w-3.5 sm:block" />
                <span className="truncate sm:hidden">{tab.shortLabel}</span>
                <span className="hidden truncate sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">{renderTabContent()}</div>
    </div>
  );

  const editorPanel = (
    <CodeEditor
      initialLanguage={language}
      initialCode={starterCode}
      onChange={(value) => {
        setCode(value);
        setInputError(null);
      }}
      onLanguageChange={setLanguage}
      onRun={handleRun}
      onSubmit={handleSubmit}
    />
  );

  const rightPanel = isResultPanelMinimized ? (
    <div className="h-full min-h-0" style={{ display: "grid", gridTemplateRows: "1fr auto" }}>
      <div className="min-h-0 overflow-hidden">{editorPanel}</div>
      <div className="mt-2 flex items-center justify-between rounded-2xl border-2 border-black bg-[#44d07d] px-4 py-2 shadow-[2px_2px_0_0_#000] dark:border-[#fef08a] dark:bg-[#234436] dark:shadow-[2px_2px_0_0_#a9b9db]">
        <div className="text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
          Testcase &gt; Test Result
        </div>
        <button
          onClick={() => setIsResultPanelMinimized(false)}
          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-black hover:bg-[#0f92ff] dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2d3f63]"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Restore Panel
        </button>
      </div>
    </div>
  ) : (
    <SplitPane
      direction="vertical"
      initialPrimary={isWideLayout ? 420 : 340}
      minPrimary={160}
      minSecondary={0}
      storageKey={`problem-workspace-right-split-${isWideLayout ? "wide" : "stacked"}`}
      className="h-full w-full min-h-0 min-w-0"
      primary={<div className="h-full min-h-0">{editorPanel}</div>}
      secondary={
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-black bg-[#fff9d0] shadow-[2px_2px_0_0_#000] dark:border-[#fef08a] dark:bg-[#202037] dark:shadow-[2px_2px_0_0_#a9b9db]">
          <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-[#44d07d] px-4 py-2 dark:border-[#fef08a] dark:bg-[#234436]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
              <button
                onClick={() => setActiveRightTab("testcase")}
                className={`rounded px-2 py-1 ${
                  activeRightTab === "testcase"
                    ? "bg-black text-white dark:bg-[#fef08a] dark:text-black"
                    : ""
                }`}
              >
                Testcase
              </button>
              <span>&gt;</span>
              <button
                onClick={() => setActiveRightTab("result")}
                className={`rounded px-2 py-1 ${
                  activeRightTab === "result"
                    ? "bg-black text-white dark:bg-[#fef08a] dark:text-black"
                    : ""
                }`}
              >
                Test Result
              </button>
            </div>

            <button
              onClick={() => setIsResultPanelMinimized(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-black hover:bg-[#0f92ff] dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2d3f63]"
              title="Minimize testcase/result panel"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Minimize
            </button>
          </div>

          {activeRightTab === "testcase" ? (
            <>
              <div className="custom-scrollbar flex items-center gap-2 overflow-x-auto border-b-2 border-black px-3 py-3 dark:border-[#fef08a]">
                {exampleCases.map((testCase, index) => (
                  <div key={testCase.id} className="relative shrink-0">
                    <button
                      onClick={() => setActiveCaseIndex(index)}
                      className={`rounded-xl border border-black px-3 py-1.5 text-xs font-black uppercase tracking-wide dark:border-[#fef08a] ${
                        testCase.isCustom ? "pr-6" : ""
                      } ${
                        index === activeCaseIndex
                          ? "bg-[#0f92ff] text-black dark:bg-[#fef08a]"
                          : "bg-white text-black dark:bg-[#151525] dark:text-[#fff9f0]"
                      }`}
                    >
                      {testCase.label}
                    </button>

                    {testCase.isCustom && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeCaseAtIndex(index);
                        }}
                        className="absolute right-1 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white text-[10px] font-black leading-none text-black hover:bg-[#ff6b35] dark:border-[#fef08a] dark:bg-[#202037] dark:text-[#fff9f0] dark:hover:bg-[#4d2a25]"
                        title="Remove this custom testcase"
                        aria-label={`Remove ${testCase.label}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addCustomCase}
                  className="shrink-0 rounded-xl border border-black bg-white px-3 py-1.5 text-xs font-black dark:border-[#fef08a] dark:bg-[#151525] dark:text-[#fff9f0]"
                  title="Add custom testcase"
                >
                  +
                </button>

                {removedCustomCase && (
                  <button
                    onClick={restoreRemovedCase}
                    className="shrink-0 rounded-xl border border-black bg-[#ffefc7] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-black dark:border-[#fef08a] dark:bg-[#2f2f4a] dark:text-[#fff9f0]"
                    title="Undo remove"
                  >
                    Undo
                  </button>
                )}
              </div>

              <div className="custom-scrollbar flex-1 overflow-auto px-4 py-4 text-sm">
                <div className="text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
                  Input
                </div>
                <textarea
                  value={activeCase?.input || ""}
                  onChange={(event) => updateActiveCaseInput(event.target.value)}
                  placeholder="Enter testcase input"
                  className="mt-2 h-28 w-full resize-none rounded-md bg-white p-2 font-mono text-xs text-black dark:bg-[#151525] dark:text-[#fff9f0]"
                />

                <div className="mt-4 text-xs font-black uppercase tracking-wide text-black dark:text-[#fef08a]">
                  Expected Output
                </div>
                {activeCase?.expectedOutput ? (
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-md border border-[#e0d5c2] bg-white p-2 text-xs text-black dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#fff9f0]">
                    {activeCase.expectedOutput}
                  </pre>
                ) : (
                  <div className="mt-2 rounded-md border border-dashed border-[#e0d5c2] bg-white p-2 text-xs text-[#5d5245] dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#d7ccbe]">
                    No expected output in this case yet. This works as custom input.
                  </div>
                )}

                {activeCase?.explanation && (
                  <div className="mt-3 rounded-md border border-[#e0d5c2] bg-white p-2 text-xs text-[#2b2116] dark:border-[#3c3347] dark:bg-[#151525] dark:text-[#f6ede0]">
                    {activeCase.explanation}
                  </div>
                )}

                {inputError && (
                  <div className="mt-3 rounded bg-rose-100 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                    {inputError}
                  </div>
                )}

                <p className="mt-4 text-xs text-[#5d5245] dark:text-[#d7ccbe]">
                  Run uses the currently selected testcase. Submit always evaluates your code
                  against the full hidden test suite from the database.
                </p>
              </div>
            </>
          ) : (
            <div className="custom-scrollbar flex-1 overflow-auto px-4 py-4 text-sm">
              {renderResultPanel()}
            </div>
          )}
        </div>
      }
    />
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 md:h-full">
      <BadgeNotification badges={newBadges} onDismiss={handleDismissBadges} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-black bg-[#fff9d0] px-4 py-2.5 shadow-[2px_2px_0_0_#000] dark:border-[#fef08a] dark:bg-[#202037] dark:shadow-[2px_2px_0_0_#a9b9db]">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Link
            href="/problems"
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-black uppercase tracking-wide text-black hover:bg-[#44d07d] dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2a3c2f]"
          >
            ← All Problems
          </Link>
          <div className="h-4 w-px bg-black dark:bg-[#fef08a]" />
          <div className="flex gap-1">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="rounded-lg bg-white p-1.5 text-black hover:bg-[#44d07d] disabled:opacity-30 dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2a3c2f]"
              title="Previous Problem"
            >
              &lt;
            </button>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="rounded-lg bg-white p-1.5 text-black hover:bg-[#44d07d] disabled:opacity-30 dark:bg-[#151525] dark:text-[#fff9f0] dark:hover:bg-[#2a3c2f]"
              title="Next Problem"
            >
              &gt;
            </button>
          </div>
          <div className="h-4 w-px bg-black dark:bg-[#fef08a]" />
          <ProblemTimer running={timerRunning} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#44d07d] px-4 py-2 text-sm font-black uppercase tracking-wide text-black hover:bg-[#35b768] disabled:opacity-50 dark:bg-[#233f35] dark:text-[#fef08a] dark:hover:bg-[#2f5043]"
          >
            {isRunning && <Spinner className="h-4 w-4" />}
            {isRunning ? "Running..." : "Run Code"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#0f92ff] px-4 py-2 text-sm font-black uppercase tracking-wide text-black hover:bg-[#077ad8] disabled:opacity-50 dark:bg-[#fef08a] dark:text-black dark:hover:bg-[#e9db63]"
          >
            {isSubmitting && <Spinner className="h-4 w-4" />}
            {isSubmitting ? "Submitting..." : user && token ? "Submit" : "Login to Submit"}
          </button>
        </div>
      </div>

      {isWideLayout ? (
        <SplitPane
          direction="horizontal"
          initialPrimary={760}
          minPrimary={340}
          minSecondary={320}
          storageKey="problem-workspace-main-wide"
          className="h-full w-full min-h-0 min-w-0"
          primary={leftPanel}
          secondary={rightPanel}
        />
      ) : (
        <SplitPane
          direction="vertical"
          initialPrimary={520}
          minPrimary={260}
          minSecondary={320}
          storageKey="problem-workspace-main-mobile"
          className="h-[132vh] min-h-170 w-full min-w-0"
          primary={leftPanel}
          secondary={rightPanel}
        />
      )}
    </section>
  );
}
