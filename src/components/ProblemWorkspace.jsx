"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, BookOpen, List, History, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import ProblemTimer from "./ProblemTimer";
import Spinner from "./Spinner";
import BadgeNotification from "./BadgeNotification";

export default function ProblemWorkspace({ problem, onNext, onPrev }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [inputError, setInputError] = useState(null);
  const [openHints, setOpenHints] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  // Stable dismiss handler - prevents BadgeNotification effect from re-running on every render
  const handleDismissBadges = useCallback(() => setNewBadges([]), []);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLastSubmissionStatus(null);
    setInputError(null);
    setCode("");
    setTimerRunning(true);
    setActiveTab("Description");
    setOpenHints([]);
    
    // Load submissions for this problem
    const loadSubmissions = async () => {
      try {
        const token = localStorage.getItem("algoryth_token");
        if (token) {
          // Try to load from server
          const response = await fetch(`/api/submissions/history?problemSlug=${problem.slug}&limit=10`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.submissions) {
              // Normalize data from server to match localStorage format
              const normalized = data.submissions.map(s => ({
                problemId: problem.id,
                slug: problem.slug,
                problemTitle: s.problemTitle,
                status: s.verdict,
                language: s.language,
                timestamp: s.submittedAt || new Date().toISOString()
              }));
              setSubmissions(normalized);
              return;
            }
          }
        }

        // Fallback to local submissions
        const allSubmissions = JSON.parse(localStorage.getItem("algoryth_submissions") || "[]");
        const validSubmissions = allSubmissions.filter(s => s.problemId === problem.id || s.slug === problem.slug);
        setSubmissions(validSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (e) {
        console.error("Failed to load submissions", e);
      }
    };

    loadSubmissions();
  }, [problem.id, problem.slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    setInputError(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success === false) {
        setLastSubmissionStatus(`Error:\n${result.error?.message || "Unknown error"}`);
      } else {
        const { output, error } = result.data || result;
        if (error) {
           setLastSubmissionStatus(`Error:\n${error}`);
        } else {
           setLastSubmissionStatus(`Output:\n${JSON.stringify(output, null, 2) ?? "No output"}`);
        }
      }
    } catch (err) {
      setLastSubmissionStatus(`Execution Error: ${err.message}`);
    }

    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!validateBeforeRun()) return;

    setTimerRunning(false);
    setIsSubmitting(true);
    setLastSubmissionStatus(null);
    setInputError(null);
    setNewBadges([]);

    let verdict = "Submission Error";
    let earnedBadges = [];

    try {
      // Get token for authentication
      const token = localStorage.getItem('algoryth_token');

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          slug: problem.slug,
          code,
          language,
        }),
      });

      const result = await response.json();
      
      if (result.success === false) {
        verdict = result.error?.message || "Internal Error";
      } else {
        // Capture new badges from response
        if (result.newBadges && result.newBadges.length > 0) {
          earnedBadges = result.newBadges;
          setNewBadges(result.newBadges);
        }

        // Save to localStorage for dashboard tracking
        try {
          const raw = localStorage.getItem("algoryth_submissions");
          const submissions = raw ? JSON.parse(raw) : [];
          const newEntry = {
            problemId: problem.id,
            problemTitle: problem.title,
            difficulty: problem.difficulty,
            status: result.status,
            language: language,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem("algoryth_submissions", JSON.stringify([newEntry, ...submissions]));
        } catch (e) {
          console.error("Error saving submission to localStorage:", e);
        }
        verdict = result.data?.verdict || result.verdict || "Unknown";
      }

      setLastSubmissionStatus(verdict);
    } catch {
      verdict = "Network Error";
      setLastSubmissionStatus(verdict);
    }

    // Save submission locally for offline access
    const newSubmission = {
      problemId: problem.id,
      slug: problem.slug,
      problemTitle: problem.title,
      status: verdict,
      language,
      code,
      timestamp: new Date().toISOString()
    };
    
    setSubmissions(prev => [newSubmission, ...prev]);
    
    // Also save to localStorage as backup
    try {
      const allSubmissions = JSON.parse(localStorage.getItem("algoryth_submissions") || "[]");
      allSubmissions.push(newSubmission);
      localStorage.setItem("algoryth_submissions", JSON.stringify(allSubmissions));
    } catch (e) {
      console.error("Failed to save submission to localStorage backup:", e);
    }

    setIsSubmitting(false);
    // Switch to submissions tab to show result
    setActiveTab("Submissions");
  };

  const toggleHint = (i) => {
    setOpenHints((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const tabs = [
    { id: "Description", icon: FileText, label: "Description" },
    { id: "Editorial", icon: BookOpen, label: "Editorial" },
    { id: "Solutions", icon: List, label: "Solutions" },
    { id: "Submissions", icon: History, label: "Submissions" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2b2116] dark:text-[#f6ede0]">
              {problem.statement}
            </p>

            <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Constraints</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
              {problem.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Examples</h3>
            <div className="mt-2 grid gap-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-lg border border-[#e0d5c2] bg-white p-3 text-sm dark:border-[#3c3347] dark:bg-[#211d27]">
                  <div className="font-medium text-[#2b2116] dark:text-[#f6ede0]">Input</div>
                  <pre className="mt-1 overflow-x-auto rounded bg-[#f7f0e0] p-2 font-mono text-xs dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                    {ex.input}
                  </pre>
                  <div className="mt-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">Output</div>
                  <pre className="mt-1 overflow-x-auto rounded bg-[#f7f0e0] p-2 font-mono text-xs dark:bg-[#2d2535] dark:text-[#d7ccbe]">
                    {ex.output}
                  </pre>
                  {ex.explaination && (
                    <>
                      <div className="mt-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">Explanation</div>
                      <p className="text-xs text-[#5d5245] dark:text-[#d7ccbe] mt-1">{ex.explaination}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {problem.hints && (
              <>
                <h3 className="mt-6 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">Hints</h3>
                <div className="mt-2 grid gap-2">
                  {problem.hints.map((hint, i) => (
                    <div
                      key={i}
                      className="cursor-pointer rounded border border-[#e0d5c2] p-2 text-sm transition-colors hover:bg-[#fff8ed] dark:border-[#3c3347] dark:hover:bg-[#2d2535]"
                      onClick={() => toggleHint(i)}
                    >
                      <div className="flex items-center gap-2 font-medium text-[#2b2116] dark:text-[#f6ede0]">
                        <span>💡 Hint {i + 1}</span>
                      </div>
                      {openHints.includes(i) && <p className="mt-2 text-[#5d5245] dark:text-[#d7ccbe]">{hint}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      
      case "Editorial":
        return (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 rounded-full bg-[#f2e3cc] p-4 dark:bg-[#292331]">
              <BookOpen className="h-8 w-8 text-[#d69a44] dark:text-[#f2c66f]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2b2116] dark:text-[#f6ede0]">Editorial Coming Soon</h3>
            <p className="mt-2 max-w-xs text-sm text-[#5d5245] dark:text-[#d7ccbe]">
              Our team is working on a detailed explanation for this problem. Check back later!
            </p>
          </div>
        );

      case "Solutions":
        return (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">Community Solutions</h3>
                <span className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">Top Rated</span>
             </div>
             {/* Mock Solutions */}
             {[1, 2, 3].map((i) => (
               <div key={i} className="cursor-pointer rounded-lg border border-[#e0d5c2] bg-white p-4 transition-all hover:shadow-sm dark:border-[#3c3347] dark:bg-[#211d27]">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500" />
                   <div>
                     <div className="text-sm font-medium text-[#2b2116] dark:text-[#f6ede0]">User_{100+i}</div>
                     <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">JavaScript • 2ms • 45MB</div>
                   </div>
                 </div>
                 <h4 className="mt-3 text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">My O(n) Approach with HashMap</h4>
                 <div className="mt-2 flex gap-2">
                   <span className="rounded bg-[#f7f0e0] px-2 py-0.5 text-xs text-[#5d5245] dark:bg-[#2d2535] dark:text-[#d7ccbe]">Easy to understand</span>
                   <span className="rounded bg-[#f7f0e0] px-2 py-0.5 text-xs text-[#5d5245] dark:bg-[#2d2535] dark:text-[#d7ccbe]">Clean code</span>
                 </div>
               </div>
             ))}
          </div>
        );

      case "Submissions":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">Your Submissions</h3>
            {submissions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-[#e0d5c2] dark:border-[#3c3347]">
                 <History className="h-8 w-8 text-[#b5a08a] dark:text-[#7f748a] mb-2" />
                 <p className="text-sm text-[#5d5245] dark:text-[#d7ccbe]">No submissions yet</p>
                 <button 
                   onClick={() => setActiveTab("Description")}
                   className="mt-2 text-xs font-semibold text-[#d69a44] hover:underline dark:text-[#f2c66f]"
                 >
                   Start solving
                 </button>
               </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-[#e0d5c2] bg-white p-3 text-sm dark:border-[#3c3347] dark:bg-[#211d27]">
                    <div className="flex items-center gap-3">
                      {sub.status === "Accepted" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : sub.status?.includes("Error") ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                      <div>
                        <div className={`font-semibold ${
                          sub.status === "Accepted" ? "text-emerald-700 dark:text-emerald-400" :
                          sub.status?.includes("Error") ? "text-amber-700 dark:text-amber-400" :
                          "text-rose-700 dark:text-rose-400"
                        }`}>
                          {sub.status}
                        </div>
                        <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
                          {new Date(sub.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-mono text-[#5d5245] dark:text-[#d7ccbe]">{sub.language}</div>
                      {/* Placeholder for runtime/memory if we had it */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const leftPanel = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
      {/* Header */}
      <div className="border-b border-[#e0d5c2] bg-[#f2e3cc]/30 px-5 py-4 dark:border-[#3c3347] dark:bg-[#292331]/30">
        <div className="flex items-center justify-between">
          <div>
             <div className="text-xs font-medium text-[#8a7a67] dark:text-[#b5a59c]">{problem.id}</div>
             <h1 className="text-xl font-bold text-[#2b2116] dark:text-[#f6ede0]">{problem.title}</h1>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            problem.difficulty === "Easy" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
            problem.difficulty === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
            "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
          }`}>
            {problem.difficulty}
          </span>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 flex space-x-1 rounded-lg bg-[#e0d5c2]/50 p-1 dark:bg-[#3c3347]/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-[#2b2116] shadow-sm dark:bg-[#211d27] dark:text-[#f6ede0]"
                    : "text-[#5d5245] hover:bg-white/50 dark:text-[#b5a59c] dark:hover:bg-[#211d27]/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        {renderTabContent()}
      </div>
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
          initialCode={starterCode}
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
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
          <div className="border-b border-[#e0d5c2] bg-[#f2e3cc]/30 px-4 py-2 text-xs font-semibold text-[#5d5245] dark:border-[#3c3347] dark:bg-[#292331]/30 dark:text-[#d7ccbe]">
            Test Result
          </div>
          <div className="flex-1 overflow-auto px-4 pt-4 text-sm code-font">
            {inputError && (
              <div className="mb-3 rounded bg-rose-100 px-3 py-2 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                {inputError}
              </div>
            )}
            {lastSubmissionStatus ? (
              <pre className="whitespace-pre-wrap text-[#2b2116] dark:text-[#f6ede0]">
                {lastSubmissionStatus}
              </pre>
            ) : (
              <div className="text-[#8a7a67] dark:text-[#b5a59c] italic">
                Run your code to see results here...
              </div>
            )}
          </div>
        </div>
      }
    />
  );

  return (
    <section className="flex flex-col gap-4 min-h-0 flex-1">
      <BadgeNotification 
        badges={newBadges}
        onDismiss={handleDismissBadges}
      />
      <div className="flex items-center justify-between rounded-2xl border border-[#e0d5c2] bg-white px-4 py-3 dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="flex items-center gap-2">
          <Link 
            href="/problems"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[#5d5245] hover:bg-[#f7f0e0] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
          >
            ← All Problems
          </Link>
          <div className="h-4 w-px bg-[#e0d5c2] dark:bg-[#3c3347]" />
          <div className="flex gap-1">
            <button 
              onClick={onPrev} 
              disabled={!onPrev}
              className="rounded-lg p-1.5 text-[#5d5245] hover:bg-[#f7f0e0] disabled:opacity-30 dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              title="Previous Problem"
            >
              &lt;
            </button>
            <button 
              onClick={onNext} 
              disabled={!onNext}
              className="rounded-lg p-1.5 text-[#5d5245] hover:bg-[#f7f0e0] disabled:opacity-30 dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
              title="Next Problem"
            >
              &gt;
            </button>
          </div>
          <div className="h-4 w-px bg-[#e0d5c2] dark:bg-[#3c3347]" />
          <ProblemTimer running={timerRunning} />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleRun} 
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#f7f0e0] px-4 py-2 text-sm font-semibold text-[#5d5245] hover:bg-[#f2e3cc] disabled:opacity-50 dark:bg-[#2d2535] dark:text-[#d7ccbe] dark:hover:bg-[#3c3347]"
          >
             {isRunning && <Spinner className="h-4 w-4" />}
             {isRunning ? "Running..." : "Run Code"}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#d69a44] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c99a4c] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#f2d580]"
          >
             {isSubmitting && <Spinner className="h-4 w-4" />}
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
