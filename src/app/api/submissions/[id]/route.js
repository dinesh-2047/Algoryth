import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import Submission from '@/lib/db/models/Submission';
import { authenticateUser } from '@/lib/db/middleware';

/**
 * Get Single Submission by ID
 */
export async function GET(request, { params }) {
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

    const { id } = params;

    // Get submission
    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user owns this submission
    if (submission.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ submission }, { status: 200 });
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete Submission
 */
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Get submission
    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user owns this submission
    if (submission.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Submission.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Submission deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
