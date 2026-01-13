import Link from "next/link";
import { notFound } from "next/navigation";

// Data
const TOPIC_PROBLEMS = {
  arrays: {
    title: "Arrays",
    problems: [
      { title: "Two Sum", slug: "two-sum", diff: "Easy" },
      { title: "Maximum Subarray", slug: "max-subarray", diff: "Medium" },
    ],
  },
  trees: {
    title: "Trees",
    problems: [
      { title: "Inorder Traversal", slug: "binary-tree-inorder-traversal", diff: "Easy" },
      { title: "Validate BST", slug: "validate-bst", diff: "Medium" },
    ],
  },
};

// Dynamic route page
export default function TopicPage({ params }) {
  // Safety check: params exists
  if (!params || !params.slug) {
    notFound();
  }

  const slug = params.slug.toLowerCase(); // ensure lowercase match
  const topic = TOPIC_PROBLEMS[slug];

  if (!topic) notFound();

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
        {topic.title}
      </h1>

      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {topic.problems.map((p) => (
            <Link
              key={p.slug}
              href={`/problems/${p.slug}`}
              className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[#f2e3cc] dark:hover:bg-[#2d2535]"
            >
              <span className="text-[#2b2116] dark:text-[#f6ede0]">{p.title}</span>
              <span className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">{p.diff}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
