import { getProblemBySlug, getProblems } from "../../../lib/problem-store";
import { connectToDatabase } from "../../../lib/db/connect";
import Contest from "../../../lib/db/models/Contest";
import { notFound } from "next/navigation";
import ProblemNavigator from "../../../components/ProblemNavigator";

export default async function ProblemDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const contestSlug = String(query?.contest || "").trim();

  let includePrivate = false;
  let contestProblemSlugs = [];

  if (contestSlug && process.env.MONGODB_URI) {
    try {
      await connectToDatabase();

      const contest = await Contest.findOne({ slug: contestSlug, isPublic: true })
        .select({ startTime: 1, endTime: 1, problems: 1 })
        .lean();

      if (contest) {
        const now = new Date().getTime();
        const start = new Date(contest.startTime).getTime();

        contestProblemSlugs = (contest.problems || []).map((item) => item.problemSlug);

        if (contestProblemSlugs.includes(slug) && now >= start) {
          includePrivate = true;
        }
      }
    } catch (error) {
      console.error("Failed to validate contest access:", error);
    }
  }

  const problem = await getProblemBySlug(slug, { includePrivate });

  let allProblems = [];
  if (includePrivate && contestProblemSlugs.length > 0) {
    const contestProblems = await Promise.all(
      contestProblemSlugs.map((problemSlug) =>
        getProblemBySlug(problemSlug, { includePrivate: true })
      )
    );
    allProblems = contestProblems.filter(Boolean);
  } else {
    allProblems = await getProblems({ sort: "rating" });
  }

  if (!problem) {
    notFound();
  }

  return (
    <ProblemNavigator
      initialSlug={slug}
      initialProblem={problem}
      problemList={allProblems}
      contestSlug={includePrivate ? contestSlug : undefined}
    />
  );
}
