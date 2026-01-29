import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import Submission from '@/lib/db/models/Submission';
import UserProfile from '@/lib/db/models/UserProfile';
import { authenticateUser } from '@/lib/db/middleware';

/**
 * Get User Submissions
 * Query params: page, limit, problemId, status, language
 */
export async function GET(request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const problemId = searchParams.get('problemId');
    const status = searchParams.get('status');
    const language = searchParams.get('language');

    // Build query
    const query = { userId: user.userId };
    if (problemId) query.problemId = problemId;
    if (status) query.status = status;
    if (language) query.language = language;

    // Get submissions with pagination
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-code'); // Don't send full code in list view

    // Get total count
    const total = await Submission.countDocuments(query);

    return NextResponse.json(
      {
        submissions,
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
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create New Submission
 */
export async function POST(request) {
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

    const submissionData = await request.json();

    // Validate required fields
    const required = ['problemId', 'problemTitle', 'language', 'code', 'status'];
    for (const field of required) {
      if (!submissionData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create submission
    const submission = new Submission({
      userId: user.userId,
      ...submissionData,
    });

    await submission.save();

    // Update user profile stats
    const profile = await UserProfile.findOne({ userId: user.userId });
    
    if (profile) {
      profile.submissions.total += 1;
      
      if (submissionData.status === 'Accepted') {
        profile.submissions.accepted += 1;
        
        // Add to solved problems if not already solved
        if (!profile.solvedProblemIds.includes(submissionData.problemId)) {
          profile.solvedProblemIds.push(submissionData.problemId);
          profile.solvedProblems.total += 1;
          
          // Update difficulty count (you can pass difficulty in request)
          if (submissionData.difficulty) {
            profile.solvedProblems[submissionData.difficulty] += 1;
          }
        }
      }
      
      // Update acceptance rate
      profile.updateAcceptanceRate();
      profile.lastActive = Date.now();
      await profile.save();
    }

    return NextResponse.json(
      { message: 'Submission created successfully', submission },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";

export async function POST(request) {
  try {
    const { slug, code } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { verdict: "Error", message: "Empty code" },
        { status: 400 }
      );
    }

    const problem = getProblemBySlug(slug);

    if (!problem || !problem.testCases) {
      return NextResponse.json(
        { verdict: "Error", message: "Problem or test cases not found" },
        { status: 404 }
      );
    }

    let userFunction;

    try {
      // User must define solve(input)
      userFunction = new Function(
        `${code}; return solve;`
      )();
    } catch (err) {
      return NextResponse.json({
        verdict: "Runtime Error",
        error: err.toString(),
      });
    }

    for (const test of problem.testCases) {
      let userOutput;

      try {
        userOutput = userFunction(JSON.parse(test.input));
      } catch (err) {
        return NextResponse.json({
          verdict: "Runtime Error",
          error: err.toString(),
        });
      }

      const expected = JSON.stringify(
        JSON.parse(test.output)
      );

      const actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        return NextResponse.json({
          verdict: "Wrong Answer",
          expected,
          actual,
        });
      }
    }

    return NextResponse.json({ verdict: "Accepted" });
  } catch {
    return NextResponse.json(
      { verdict: "Error", message: "Invalid request" },
      { status: 400 }
    );
  }
}
