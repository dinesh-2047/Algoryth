import { getProblemBySlug } from "../../../lib/problems";
import { notFound } from "next/navigation";
import ProblemNavigator from "../../../components/ProblemNavigator";

export default async function ProblemDetailPage({ params }) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  return <ProblemNavigator initialSlug={slug} />;
}
