import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/db/middleware';
import { checkAndAwardBadges, getBadgeProgress } from '../../../../lib/db/badges/badgeUtils';

/**
 * POST /api/badges/check
 * Check and award badges for the current user
 * This is called after a submission
 */
export async function POST(request) {
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

    const userId = decoded.userId;
    const result = await checkAndAwardBadges(userId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      newBadges: result.newBadges,
      totalBadges: result.totalBadges,
      message: result.newBadges.length > 0 
        ? `Congratulations! You earned ${result.newBadges.length} new badge(s)!`
        : 'No new badges earned yet',
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/badges/check?progress=true
 * Get badge progress for the current user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const showProgress = searchParams.get('progress') === 'true';

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

    const userId = decoded.userId;

    if (showProgress) {
      const progressResult = await getBadgeProgress(userId);
      if (progressResult.error) {
        return NextResponse.json(
          { error: progressResult.error },
          { status: 400 }
        );
      }
      return NextResponse.json(progressResult);
    }

    // Default: just return earned badges
    const result = await checkAndAwardBadges(userId);
    return NextResponse.json({
      totalBadges: result.totalBadges,
      newBadges: result.newBadges,
    });
  } catch (error) {
    console.error('Error in badges/check endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
