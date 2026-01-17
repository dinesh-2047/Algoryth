import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import UserProfile from '@/lib/db/models/UserProfile';

/**
 * Get Leaderboard
 * Query params: page, limit, sortBy (rating, solved, submissions)
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'rating';

    // Determine sort field
    let sortField = {};
    switch (sortBy) {
      case 'solved':
        sortField = { 'solvedProblems.total': -1 };
        break;
      case 'submissions':
        sortField = { 'submissions.total': -1 };
        break;
      case 'rating':
      default:
        sortField = { rating: -1 };
    }

    // Get profiles sorted by rating
    const profiles = await UserProfile.find()
      .sort(sortField)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username avatar rating rank solvedProblems submissions');

    // Get total count
    const total = await UserProfile.countDocuments();

    // Add rank number to each profile
    const leaderboard = profiles.map((profile, index) => ({
      position: (page - 1) * limit + index + 1,
      username: profile.username || 'Anonymous',
      avatar: profile.avatar,
      rating: profile.rating,
      rank: profile.rank,
      solvedProblems: profile.solvedProblems.total,
      submissions: profile.submissions.total,
      acceptanceRate: profile.submissions.acceptanceRate,
    }));

    return NextResponse.json(
      {
        leaderboard,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
