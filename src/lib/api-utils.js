// API Error handling utilities
export class APIError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Consistent error response format
export function createErrorResponse(error, includeStack = false) {
  const response = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      ...(error.field && { field: error.field }),
      ...(includeStack && error.stack && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
  };

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] API Error:`, {
    code: error.code,
    message: error.message,
    status: error.status,
    stack: includeStack ? error.stack : undefined,
  });

  return response;
}

// Success response format
export function createSuccessResponse(data, meta = {}) {
  return {
    success: true,
    data,
    ...meta,
    timestamp: new Date().toISOString(),
  };
}

// Wrapper for API route handlers
export function withErrorHandler(handler) {
  return async (req, context) => {
    try {
      // Validate request method if specified
      if (handler.allowedMethods && !handler.allowedMethods.includes(req.method)) {
        throw new APIError(`Method ${req.method} not allowed`, 405, 'METHOD_NOT_ALLOWED');
      }

      const result = await handler(req, context);

      // If handler returns a NextResponse, return it as-is
      if (result && typeof result.json === 'function') {
        return result;
      }

      // Otherwise, wrap in success response
      return createSuccessResponse(result);

    } catch (error) {
      // Handle known API errors
      if (error instanceof APIError) {
        return Response.json(createErrorResponse(error), { status: error.status });
      }

      // Handle unexpected errors
      const apiError = new APIError(
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
        500,
        'INTERNAL_ERROR'
      );

      return Response.json(
        createErrorResponse(apiError, process.env.NODE_ENV !== 'production'),
        { status: 500 }
      );
    }
  };
}

// Input validation utilities
export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

export function validateString(value, fieldName, options = {}) {
  validateRequired(value, fieldName);

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  if (options.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`, fieldName);
  }

  if (options.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`, fieldName);
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new ValidationError(`${fieldName} format is invalid`, fieldName);
  }
}

export function validateSlug(slug) {
  validateString(slug, 'slug', {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
  });
}