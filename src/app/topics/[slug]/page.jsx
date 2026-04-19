import { notFound } from "next/navigation";
import Link from "next/link";
import { DSA_TOPICS } from "@/lib/topics";
import { getProblems } from "@/lib/problem-store";

// Dynamic route page
export default async function TopicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const topicTag = slug.toLowerCase();

  const problems = await getProblems({ sort: "rating" });

  // Filter problems that have this slug as one of their tags
  const filteredProblems = problems.filter(p =>
    p.tags?.some(tag => tag.toLowerCase() === topicTag)
  );

  if (filteredProblems.length === 0) {
    // Check if the topic exists in the roadmap even if no problems are assigned yet
    // This prevents 404 for valid roadmap items
    const isValidTopic = DSA_TOPICS.some(t => t.slug === slug);
    if (!isValidTopic) {
      notFound();
    }

    // Fall through to render empty state
  }

  // Format title from slug (e.g., "bit-manipulation" -> "Bit Manipulation")
  const title = DSA_TOPICS.find(t => t.slug === slug)?.title || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <section className="grid gap-6">
      <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
        {title}
      </h1>

      <div className="neo-card overflow-hidden">
        <div className="divide-y-2 divide-black dark:divide-[#a9b9db]">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((p) => (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="flex items-center justify-between px-6 py-4 text-sm font-semibold transition-colors hover:bg-[#fff4a3] dark:hover:bg-[#25304a]"
              >
                <span className="font-black uppercase text-black dark:text-[#eef3ff]">{p.title}</span>
                <span className="text-xs font-black uppercase text-black/70 dark:text-[#d4deff]/80">
                  {p.difficulty || (p.rating < 1300 ? "Easy" : p.rating < 1900 ? "Medium" : "Hard")}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-black/75 dark:text-[#d4deff]/80">
              <p>No problems available for this topic yet.</p>
              <p className="text-xs mt-1">Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
