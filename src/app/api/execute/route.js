import { NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse, validateRequiredFields, logApiRequest, logApiError } from "../../../lib/api-utils";

export async function POST(request) {
  try {
    logApiRequest('POST', '/api/execute');

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, ['code']);
    if (validationError) {
      return createErrorResponse(validationError, 400, 'MISSING_REQUIRED_FIELDS');
    }

    const { code, input } = body;

    // Validate code is a non-empty string
    if (typeof code !== 'string' || code.trim().length === 0) {
      return createErrorResponse('Code must be a non-empty string', 400, 'INVALID_CODE');
    }

    let output = null;
    let error = null;

    try {
      // User must define solve(input)
      const solve = new Function(`${code}; return solve;`)();
      output = solve(input ? JSON.parse(input) : undefined);
    } catch (err) {
      error = err.toString();
    }

    return createSuccessResponse({
      output,
      error,
    });
  } catch (error) {
    logApiError('POST', '/api/execute', error);
    return createErrorResponse('Failed to execute code', 500, 'EXECUTION_ERROR');
  }
}
