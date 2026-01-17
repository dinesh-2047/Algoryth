import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import UserProfile from '@/lib/db/models/UserProfile';

/**
 * Get User Statistics
 * Public endpoint - can view any user's stats by username or ID
 */
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { username } = params;

    // Find profile by username or userId
    let profile;
    
    // Check if it's a MongoDB ObjectId (userId) or username
    if (username.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await UserProfile.findOne({ userId: username });
    } else {
      profile = await UserProfile.findOne({ username });
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return public profile data only
    const publicProfile = {
      username: profile.username,
      bio: profile.bio,
      avatar: profile.avatar,
      rating: profile.rating,
      rank: profile.rank,
      solvedProblems: profile.solvedProblems,
      submissions: {
        total: profile.submissions.total,
        accepted: profile.submissions.accepted,
        acceptanceRate: profile.submissions.acceptanceRate,
      },
      socialLinks: profile.socialLinks,
      createdAt: profile.createdAt,
    };

    return NextResponse.json({ profile: publicProfile }, { status: 200 });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
