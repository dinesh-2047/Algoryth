"use client";

import { useState } from "react";
import Link from "next/link";
import CodeEditor from "./CodeEditor";
import SplitPane from "./SplitPane";
import { TabContentSkeleton, LoadingSpinner } from "./Skeleton";

export default function ProblemWorkspace({ problem }) {
  const [activeTab, setActiveTab] = useState("description");
  const [tabLoading, setTabLoading] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "editorial", label: "Editorial" },
    { id: "solutions", label: "Solutions" },
    { id: "submissions", label: "Submissions" },
  ];

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      setTabLoading(true);
      // Small delay to show loading state for better UX
      setTimeout(() => {
        setActiveTab(tabId);
        setTabLoading(false);
      }, 150);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <>
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
          </>
        );

      case "editorial":
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Editorial</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Detailed solution explanation and approach for {problem.title}
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-3">Solution Approach</h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                This problem can be solved using a {problem.tags[0] || "efficient"} approach.
                The key insight is to understand the problem constraints and find an optimal solution.
              </p>
              <div className="bg-white dark:bg-zinc-900 rounded p-4 border">
                <h5 className="font-medium mb-2">Time Complexity: O(n)</h5>
                <h5 className="font-medium mb-2">Space Complexity: O(1)</h5>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon: Detailed step-by-step explanation with code walkthrough.
                </p>
              </div>
            </div>
          </div>
        );

      case "solutions":
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-lg font-semibold mb-2">Community Solutions</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              View different approaches and solutions from the community
            </p>
            <div className="space-y-4">
              {[
                { language: "JavaScript", votes: 42, author: "dev_user", time: "2 weeks ago" },
                { language: "Python", votes: 38, author: "code_master", time: "1 week ago" },
                { language: "Java", votes: 25, author: "java_guru", time: "3 days ago" },
              ].map((solution, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 border border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-black text-white text-xs rounded dark:bg-white dark:text-black">
                        {solution.language}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        by {solution.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">👍 {solution.votes}</span>
                      <span className="text-sm text-zinc-500">{solution.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Clean and efficient solution using {solution.language.toLowerCase()}.
                    Time: O(n), Space: O(1).
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "submissions":
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Your Submissions</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Track your submission history and performance
            </p>
            <div className="space-y-4">
              {[
                { status: "Accepted", language: "JavaScript", time: "2 hours ago", runtime: "45ms" },
                { status: "Wrong Answer", language: "JavaScript", time: "1 day ago", runtime: "42ms" },
                { status: "Time Limit Exceeded", language: "Python", time: "3 days ago", runtime: "2000ms" },
              ].map((submission, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 border border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        submission.status === "Accepted"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : submission.status === "Wrong Answer"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {submission.status}
                      </span>
                      <span className="px-2 py-1 bg-black text-white text-xs rounded dark:bg-white dark:text-black">
                        {submission.language}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500">{submission.time}</span>
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    Runtime: {submission.runtime} | Memory: 14.2 MB
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={tabLoading}
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
                activeTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border border-black/10 text-zinc-500 hover:text-zinc-700 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-200"
              } ${tabLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.label}
            </button>
          ))}
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
        {tabLoading ? <TabContentSkeleton /> : renderTabContent()}
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
      primary={<CodeEditor initialLanguage="javascript" problemTitle={problem.title} />}
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
            You must run your code first.
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
            disabled={navigationLoading}
          >
            {navigationLoading ? <LoadingSpinner size="sm" /> : "<"}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm text-zinc-700 hover:bg-black/3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10"
            aria-label="Next"
            disabled={navigationLoading}
          >
            {navigationLoading ? <LoadingSpinner size="sm" /> : ">"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={runLoading}
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {runLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Running...
              </>
            ) : (
              "Run"
            )}
          </button>
          <button
            type="button"
            disabled={submitLoading}
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
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
