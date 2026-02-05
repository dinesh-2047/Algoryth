import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { authenticateUser } from '@/lib/db/middleware';

/**
 * Verify JWT Token and Get Current User
 * 
 * This endpoint verifies the JWT token and returns the current user's data
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    // Authenticate user from token
    const { authenticated, user, error } = authenticateUser(request);

    if (!authenticated) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch full user data from database
    const userData = await User.findById(user.userId).select('-password');

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        user: {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: userData.createdAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
