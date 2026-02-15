import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../../lib/problems";
import { createErrorResponse, createSuccessResponse, logApiRequest, logApiError } from "../../../../lib/api-utils";

export function GET(
  _req,
  { params }
) {
  try {
    logApiRequest('GET', `/api/problems/${params.slug}`);

    // Validate slug parameter
    if (!params.slug || typeof params.slug !== 'string') {
      return createErrorResponse('Invalid problem slug', 400, 'INVALID_SLUG');
    }

    const problem = getProblemBySlug(params.slug);

    if (!problem) {
      return createErrorResponse('Problem not found', 404, 'PROBLEM_NOT_FOUND');
    }

    return createSuccessResponse({
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      statement: problem.statement,
      constraints: problem.constraints,
      examples: problem.examples,
    });
  } catch (error) {
    logApiError('GET', `/api/problems/${params.slug}`, error);
    return createErrorResponse('Failed to fetch problem', 500, 'FETCH_PROBLEM_ERROR');
  }
}
