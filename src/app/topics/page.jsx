import Link from "next/link";
import { title } from "node:process";

const DSA_TOPICS = [
  { title: "Arrays", slug: "arrays", description: "Sequential data structures" },
  { title: "Strings", slug: "strings", description: "Text processing techniques" },
  { title: "Bit Manipulation", slug: "bit-manipulation", description: "Binary operations" },
  { title: "Hash Tables", slug: "hash-tables", description: "Key-value storage" },
  { title: "2 Pointers", slug: "two-pointers", description: "Two-pointer techniques" },
  { title: "Prefix Sums", slug: "prefix-sums", description: "Efficient range queries" },
  { title: "Sliding Window", slug: "sliding-window", description: "Efficient window-based algorithms" },
  { title: "Kadene's Algorithm" , slug: "kadenes-algorithm", description: "Maximum subarray problems" },
  { title: "Matrix", slug: "matrix", description: "2D array operations" },
  { title: "Linked List", slug: "linked-list", description: "Dynamic linear structures" },
  { title: "Stacks & Queues", slug: "stacks-queues", description: "LIFO and FIFO structures" },
  { title: "Sorting Algorithms", slug: "sorting-algorithms", description: "Data ordering techniques" },
  { title: "Recursion", slug: "recursion", description: "Self-referential functions" },
  { title: "Backtracking", slug: "backtracking", description: "Constraint satisfaction" },
  { title: "Trees", slug: "trees", description: "Hierarchical data structures" },
  { title: "Graphs", slug: "graphs", description: "Node-edge relationships" },
];

export default function TopicsPage() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
          DSA Roadmap
        </h1>
        <p className="mt-1 text-sm text-[#5d5245] dark:text-[#b5a59c]">
          Choose a topic and start practicing problems.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DSA_TOPICS.map((topic) => (
          <Link
  key={topic.slug}
  href={`/topics/${topic.slug}`}  // must match TOPIC_PROBLEMS key
  className="rounded-xl border border-[#e0d5c2] bg-[#fff8ed] p-4 hover:bg-[#f2e3cc] dark:border-[#3c3347] dark:bg-[#211d27] dark:hover:bg-[#2d2535]"
>
  <h2 className="text-sm font-semibold text-[#2b2116] dark:text-[#f6ede0]">{topic.title}</h2>
  <p className="mt-1 text-xs text-[#6f6251] dark:text-[#b5a59c]">{topic.description}</p>
</Link>

        ))}
      </div>
    </section>
  );
}
