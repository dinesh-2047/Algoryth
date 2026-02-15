import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";
import { createErrorResponse, createSuccessResponse, validateRequiredFields, logApiRequest, logApiError } from "../../../lib/api-utils";

export async function POST(request) {
  try {
    logApiRequest('POST', '/api/submissions');

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, ['slug', 'code']);
    if (validationError) {
      return createErrorResponse(validationError, 400, 'MISSING_REQUIRED_FIELDS');
    }

    const { slug, code } = body;

    // Validate inputs
    if (typeof slug !== 'string' || slug.trim().length === 0) {
      return createErrorResponse('Slug must be a non-empty string', 400, 'INVALID_SLUG');
    }

    if (typeof code !== 'string' || code.trim().length === 0) {
      return createErrorResponse('Code must be a non-empty string', 400, 'INVALID_CODE');
    }

    const problem = getProblemBySlug(slug);

    if (!problem) {
      return createErrorResponse('Problem not found', 404, 'PROBLEM_NOT_FOUND');
    }

    if (!problem.testCases || !Array.isArray(problem.testCases)) {
      return createErrorResponse('Problem test cases not available', 404, 'TEST_CASES_NOT_FOUND');
    }

    let userFunction;

    try {
      // User must define solve(input)
      userFunction = new Function(
        `${code}; return solve;`
      )();
    } catch (err) {
      return createSuccessResponse({
        verdict: "Runtime Error",
        error: err.toString(),
      });
    }

    for (const test of problem.testCases) {
      let userOutput;

      try {
        userOutput = userFunction(JSON.parse(test.input));
      } catch (err) {
        return createSuccessResponse({
          verdict: "Runtime Error",
          error: err.toString(),
        });
      }

      const expected = JSON.stringify(
        JSON.parse(test.output)
      );

      const actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        return createSuccessResponse({
          verdict: "Wrong Answer",
          expected,
          actual,
        });
      }
    }

    return createSuccessResponse({ verdict: "Accepted" });
  } catch (error) {
    logApiError('POST', '/api/submissions', error);
    return createErrorResponse('Failed to process submission', 500, 'SUBMISSION_ERROR');
  }
}
