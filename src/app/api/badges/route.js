import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/connect';
import Badge from '../../../lib/db/models/Badge';
import mvpBadges from '../../../lib/db/badges/badgeData';

/**
 * GET /api/badges
 * Get all available badges
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const badges = await Badge.find({ isActive: true })
      .sort({ rarity: 1, createdAt: -1 })
      .select('-__v');

    if (badges.length === 0) {
      return NextResponse.json(
        {
          badges: [],
          message: 'No badges found. Run POST /api/badges/initialize to seed badges.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      badges,
      total: badges.length,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges/initialize
 * Initialize badges collection with MVP badge data (one-time setup)
 * This endpoint should be called once to seed the initial badges
 */
export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action !== 'initialize') {
      return NextResponse.json(
        { error: 'Invalid action. Use action: "initialize"' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if badges already exist
    const existingBadges = await Badge.countDocuments();
    if (existingBadges > 0) {
      return NextResponse.json(
        {
          message: 'Badges already initialized',
          total: existingBadges,
        },
        { status: 200 }
      );
    }

    // Insert MVP badges
    const insertedBadges = await Badge.insertMany(mvpBadges);

    return NextResponse.json({
      message: 'Badges initialized successfully',
      total: insertedBadges.length,
      badges: insertedBadges,
    });
  } catch (error) {
    console.error('Error initializing badges:', error);
    return NextResponse.json(
      { error: 'Failed to initialize badges' },
      { status: 500 }
    );
  }
}
