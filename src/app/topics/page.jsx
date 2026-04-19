import Link from "next/link";
import { DSA_TOPICS } from "@/lib/topics";

export default function TopicsPage() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
          DSA Roadmap
        </h1>
        <p className="mt-1 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          Choose a topic and start practicing problems.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DSA_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}  // must match TOPIC_PROBLEMS key
            className="neo-card p-4 transition-all hover:-translate-y-0.5"
          >
            <h2 className="text-base font-black uppercase text-black dark:text-[#eef3ff]">{topic.title}</h2>
            <p className="mt-1 text-xs font-semibold text-black/70 dark:text-[#d4deff]/75">{topic.description}</p>
          </Link>

        ))}
      </div>
    </section>
  );
}
