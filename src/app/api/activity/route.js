import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../lib/db/connect';
import Submission from '../../../lib/db/models/Submission';
import { verifyToken } from '../../../lib/db/middleware';

/**
 * GET /api/activity
 * Returns daily submission counts for the past 365 days
 * Used to power the activity heatmap on the Achievements page
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

    await connectToDatabase();

    const userId =
      typeof decoded.userId === 'string'
        ? new mongoose.Types.ObjectId(decoded.userId)
        : decoded.userId;

    // Go back exactly 365 days from today
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

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
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' },
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