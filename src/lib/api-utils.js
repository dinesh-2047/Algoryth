import { NextResponse } from 'next/server';

/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code for client-side handling
 * @param {object} details - Additional error details
 */
export function createErrorResponse(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
  const error = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    error.error.details = details;
  }

  return NextResponse.json(error, { status });
}

/**
 * Standard success response format
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @param {object} meta - Additional metadata
 */
export function createSuccessResponse(data, status = 200, meta = null) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response, { status });
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {string|null} - Error message if validation fails, null if valid
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !body[field]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

/**
 * Safe JSON parsing with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parsing failed:', error.message);
    return defaultValue;
  }
}

/**
 * Log API requests for debugging
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {object} data - Request data (optional)
 */
export function logApiRequest(method, path, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path}`, data ? JSON.stringify(data) : '');
}

/**
 * Log API errors for debugging
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
export function logApiError(method, path, error, context = null) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${method} ${path}:`, {
    message: error.message,
    stack: error.stack,
    context,
  });
}