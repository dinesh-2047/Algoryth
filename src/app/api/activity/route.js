import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../lib/db/connect';
import Submission from '../../../lib/db/models/Submission';
import { verifyToken } from '../../../lib/db/middleware';

/**
 * GET /api/activity
 * Returns daily submission counts for the past 365 days.
 * Used to power the activity heatmap on the Achievements page.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { valid, decoded } = verifyToken(token);

    if (!valid || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // FIX 1: Validate decoded.userId before constructing ObjectId
    // Prevents malformed payloads from throwing a 500 instead of returning 401
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(decoded.userId);

    await connectToDatabase();

    // Go back exactly 365 days from today (UTC midnight)
    const oneYearAgo = new Date();
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 365);
    oneYearAgo.setUTCHours(0, 0, 0, 0);

    const activity = await Submission.aggregate([
      {
        $match: {
          userId,
          submittedAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt', timezone: 'UTC' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}