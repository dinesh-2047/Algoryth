import { connectToDatabase } from '../../../../lib/db/connect.js';
import Submission from '../../../../lib/db/models/Submission.js';
import { verifyToken } from '../../../../lib/db/middleware.js';

/**
 * POST /api/submissions/migrate
 * Receives a single submission from localStorage and saves to database
 * This endpoint is called during the migration process
 */
export async function POST(request) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized - no token provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { valid, decoded } = verifyToken(token);
    if (!valid || !decoded || !decoded.userId) {
      return new Response(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = decoded.userId;

    // Parse request body
    const body = await request.json();
    const { slug, code, language = 'javascript', verdict = 'Pending', testsPassed = 0, totalTests = 0, executionTime = 0, memoryUsage = 0, submittedAt } = body;

    // Validate required fields
    if (!slug || !code) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields: slug, code' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if submission already exists (avoid duplicates)
    const existingSubmission = await Submission.findOne({
      userId,
      problemSlug: slug,
      code: code,
      submittedAt: submittedAt ? new Date(submittedAt) : null,
    });

    if (existingSubmission) {
      return new Response(
        JSON.stringify({ 
          message: 'Submission already exists',
          skipped: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create and save submission
    const submission = new Submission({
      userId,
      problemSlug: slug,
      code,
      language,
      verdict,
      testsPassed,
      totalTests,
      executionTime,
      memoryUsage,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
    });

    await submission.save();

    return new Response(
      JSON.stringify({
        message: 'Submission migrated successfully',
        submissionId: submission._id,
        problemSlug: submission.problemSlug,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ message: `Migration failed: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
