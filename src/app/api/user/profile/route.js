import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import UserProfile from '@/lib/db/models/UserProfile';
import { authenticateUser } from '@/lib/db/middleware';

/**
 * Get User Profile
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    // Authenticate user
    const { authenticated, user, error } = authenticateUser(request);

    if (!authenticated) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile or create if doesn't exist
    let profile = await UserProfile.findOne({ userId: user.userId });

    if (!profile) {
      // Create default profile
      profile = new UserProfile({ userId: user.userId });
      await profile.save();
    }

    // Get user basic info
    const userData = await User.findById(user.userId).select('-password');

    return NextResponse.json(
      { 
        user: {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: userData.createdAt,
        },
        profile: profile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update User Profile
 */
export async function PUT(request) {
  try {
    await connectToDatabase();

    // Authenticate user
    const { authenticated, user, error } = authenticateUser(request);

    if (!authenticated) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Find or create profile
    let profile = await UserProfile.findOne({ userId: user.userId });

    if (!profile) {
      profile = new UserProfile({ userId: user.userId });
    }

    // Update allowed fields
    const allowedUpdates = [
      'username', 'bio', 'avatar', 'preferences', 'socialLinks'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'preferences' || key === 'socialLinks') {
          // Merge nested objects
          profile[key] = { ...profile[key], ...updates[key] };
        } else {
          profile[key] = updates[key];
        }
      }
    });

    profile.lastActive = Date.now();
    await profile.save();

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate username error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
