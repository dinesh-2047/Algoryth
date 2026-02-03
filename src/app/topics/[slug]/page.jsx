import Link from "next/link";
import { notFound } from "next/navigation";
import { problems } from "@/lib/problems";

// Dynamic route page
export default async function TopicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const topicTag = slug.toLowerCase();

  // Filter problems that have this slug as one of their tags
  const filteredProblems = problems.filter(p =>
    p.tags?.some(tag => tag.toLowerCase() === topicTag)
  );

  if (filteredProblems.length === 0) {
    // Check if the topic exists in the roadmap even if no problems are assigned yet
    // This prevents 404 for valid roadmap items
    notFound();
  }

  // Format title from slug (e.g., "bit-manipulation" -> "Bit Manipulation")
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
        {title}
      </h1>

      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="divide-y divide-[#e0d5c2] dark:divide-[#3c3347]">
          {filteredProblems.map((p) => (
            <Link
              key={p.slug}
              href={`/problems/${p.slug}`}
              className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[#f2e3cc] dark:hover:bg-[#2d2535]"
            >
              <span className="text-[#2b2116] dark:text-[#f6ede0]">{p.title}</span>
              <span className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">{p.difficulty}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
