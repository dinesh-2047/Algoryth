import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../../lib/problems";
import { withErrorHandler, createSuccessResponse, NotFoundError, validateSlug } from "../../../../lib/api-utils";

export const GET = withErrorHandler(async (req, { params }) => {
  // Validate slug parameter
  const { slug } = params;
  validateSlug(slug);

  const problem = getProblemBySlug(slug);

  if (!problem) {
    throw new NotFoundError("Problem");
  }

  // Validate that the problem has all required fields
  if (!problem.id || !problem.title || !problem.statement) {
    console.error(`Problem ${slug} is missing required fields`);
    throw new NotFoundError("Problem");
  }

  const problemData = {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty || "Unknown",
    tags: Array.isArray(problem.tags) ? problem.tags : [],
    statement: problem.statement,
    constraints: Array.isArray(problem.constraints) ? problem.constraints : [],
    examples: Array.isArray(problem.examples) ? problem.examples : [],
  };

  return NextResponse.json(createSuccessResponse(problemData));
});
