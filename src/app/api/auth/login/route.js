import { connectToDatabase } from '../../../../lib/db/connect.js';
import User from '../../../../lib/db/models/User.js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createErrorResponse, createSuccessResponse, validateRequiredFields, logApiRequest, logApiError } from '../../../../lib/api-utils';

export async function POST(request) {
  try {
    logApiRequest('POST', '/api/auth/login');

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, ['email', 'password']);
    if (validationError) {
      return createErrorResponse(validationError, 400, 'MISSING_REQUIRED_FIELDS');
    }

    const { email, password } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Validate password length
    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 characters long', 400, 'INVALID_PASSWORD');
    }

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return createErrorResponse('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Create JWT token (you'll need to set a secret in your environment variables)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return success response without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return createSuccessResponse(
      {
        message: 'Login successful',
        user: userResponse,
        token: token
      }
    );
  } catch (error) {
    logApiError('POST', '/api/auth/login', error);
    return createErrorResponse('Internal server error', 500, 'LOGIN_ERROR');
  }
}