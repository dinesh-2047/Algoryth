import { getProblemBySlug } from "../../../lib/problems";
import { notFound } from "next/navigation";
import ProblemWorkspace from "../../../components/ProblemWorkspace";

export default async function ProblemDetailPage({ params }) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  return <ProblemWorkspace problem={problem} />;
}
