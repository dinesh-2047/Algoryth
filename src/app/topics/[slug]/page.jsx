"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Data
const TOPIC_PROBLEMS = {
  arrays: {
    title: "Arrays",
    problems: [
      { id: "two-sum", title: "Two Sum", slug: "two-sum", diff: "Easy" },
      { id: "max-subarray", title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
    ],
  },
  trees: {
    title: "Trees",
    problems: [
      { id: "binary-tree-inorder-traversal", title: "Inorder Traversal", slug: "binary-tree-inorder-traversal", diff: "Easy" },
      { id: "validate-bst", title: "Validate BST", slug: "validate-bst", diff: "Medium" },
    ],
  },
};

// Dynamic route page
export default function TopicPage({ params: paramsPromise }) {
  const [params, setParams] = useState(null);
  const [problemStatuses, setProblemStatuses] = useState({});

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSubmissions = localStorage.getItem("algoryth_submissions");
      if (savedSubmissions) {
        try {
          const submissions = JSON.parse(savedSubmissions);
          const statuses = {};
          submissions.forEach(sub => {
            const pid = sub.problemId;
            if (!pid) return;
            if (sub.status === "Accepted") {
              statuses[pid] = "Solved";
            } else if (statuses[pid] !== "Solved") {
              statuses[pid] = "Attempted";
            }
          });
          setTimeout(() => setProblemStatuses(statuses), 0);
        } catch (error) {
          console.error("Failed to parse submissions:", error);
        }
      }
    }
  }, []);

  if (!params) return null;
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  const topicSlug = slug.toLowerCase(); // ensure lowercase match
  const topic = TOPIC_PROBLEMS[topicSlug];

  if (!topic) notFound();

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
        {topic.title}
      </h1>

      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {topic.problems.map((p) => {
            const status = problemStatuses[p.id];
            return (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[#f2e3cc] dark:hover:bg-[#2d2535]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#2b2116] dark:text-[#f6ede0]">{p.title}</span>
                  {status === "Solved" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {status === "Attempted" && (
                    <div className="h-2 w-2 rounded-full bg-amber-500" title="Attempted" />
                  )}
                </div>
                <span className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">{p.diff}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
