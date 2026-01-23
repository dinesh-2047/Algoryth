import { connectToDatabase } from '../../../../lib/db/connect.js';
import User from '../../../../lib/db/models/User.js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createErrorResponse, createSuccessResponse, validateRequiredFields, logApiRequest, logApiError } from '../../../../lib/api-utils';

export async function POST(request) {
  try {
    logApiRequest('POST', '/api/auth/register');

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Validate required fields
    const validationError = validateRequiredFields(body, ['name', 'email', 'password']);
    if (validationError) {
      return createErrorResponse(validationError, 400, 'MISSING_REQUIRED_FIELDS');
    }

    const { name, email, password } = body;

    // Validate name
    if (typeof name !== 'string' || name.trim().length < 2) {
      return createErrorResponse('Name must be at least 2 characters long', 400, 'INVALID_NAME');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Validate password strength
    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 characters long', 400, 'INVALID_PASSWORD');
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    // Return success response without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    return createSuccessResponse(
      {
        message: 'User registered successfully',
        user: userResponse
      },
      201
    );
  } catch (error) {
    logApiError('POST', '/api/auth/register', error);
    return createErrorResponse('Internal server error', 500, 'REGISTRATION_ERROR');
  }
}