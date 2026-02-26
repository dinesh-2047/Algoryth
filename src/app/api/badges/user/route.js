import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/connect';
import { verifyToken } from '../../../../lib/db/middleware';
import UserBadge from '../../../../lib/db/models/UserBadge';
import Badge from '../../../../lib/db/models/Badge';

/**
 * GET /api/badges/user
 * Get all badges earned by the current user
 */
export async function GET(request) {
  try {
    // Verify user token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { valid, decoded } = verifyToken(token);

    if (!valid || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = decoded.userId;

    // Get user's earned badges (no populate — badgeId is a plain String, not an ObjectId ref)
    const userBadges = await UserBadge.find({ userId })
      .sort({ awardedAt: -1 })
      .select('-__v');

    // Fetch badge definitions by their string IDs
    const badgeIds = userBadges.map(ub => ub.badgeId);
    const badges = await Badge.find({ badgeId: { $in: badgeIds } }).select('-__v');

    // Build a Map for O(1) lookup
    const badgeMap = new Map(badges.map(b => [b.badgeId, b]));

    // Merge userBadge data with badge details
    const earnedBadgesWithDetails = userBadges.map(userBadge => ({
      ...userBadge.toObject(),
      badgeDetails: badgeMap.get(userBadge.badgeId) || null,
    }));

    return NextResponse.json({
      badges: earnedBadgesWithDetails,
      total: earnedBadgesWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user badges' },
      { status: 500 }
    );
  }
}


