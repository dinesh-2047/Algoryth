import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/db/connect';
import { verifyToken } from '../../../../../lib/db/middleware';
import UserBadge from '../../../../../lib/db/models/UserBadge';
import Badge from '../../../../../lib/db/models/Badge';

/**
 * GET /api/badges/user/progress
 * Get badge progress and upcoming badges for the user
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

    // Get earned badges
    const earnedBadges = await UserBadge.find({ userId }).select('badgeId');
    const earnedBadgeIds = earnedBadges.map(ub => ub.badgeId);

    // Get all badges
    const allBadges = await Badge.find({ isActive: true }).select('-__v');

    // Calculate progress
    const upcomingBadges = allBadges.filter(
      badge => !earnedBadgeIds.includes(badge.badgeId)
    );

    return NextResponse.json({
      earnedCount: earnedBadges.length,
      upcomingCount: upcomingBadges.length,
      totalBadges: allBadges.length,
      earnedPercentage: allBadges.length > 0
        ? ((earnedBadges.length / allBadges.length) * 100).toFixed(2)
        : '0.00',
      upcomingBadges: upcomingBadges.slice(0, 5), // Next 5 badges
    });
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge progress' },
      { status: 500 }
    );
  }
}
