import Link from "next/link";
import { DSA_TOPICS } from "@/lib/topics";

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
