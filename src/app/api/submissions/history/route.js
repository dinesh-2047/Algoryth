import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/connect";
import Submission from "../../../../lib/db/models/Submission";
import { verifyToken } from "../../../../lib/db/middleware";

export async function GET(request) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    const { valid, decoded } = verifyToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const problemSlug = url.searchParams.get('problemSlug');
    const verdict = url.searchParams.get('verdict');
    const language = url.searchParams.get('language');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    // Build filter query
    const filter = { userId };

    if (problemSlug) {
      filter.problemSlug = problemSlug;
    }

    if (verdict) {
      filter.verdict = verdict;
    }

    if (language) {
      filter.language = language;
    }

    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) {
        filter.submittedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.submittedAt.$lte = new Date(dateTo);
      }
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch submissions with pagination and sorting
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination metadata
    const total = await Submission.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Calculate user statistics
    const allSubmissions = await Submission.find({ userId }).lean();
    const acceptedSubmissions = allSubmissions.filter(s => s.verdict === 'Accepted');
    
    // Unique problems solved
    const uniqueProblems = new Set(acceptedSubmissions.map(s => s.problemSlug));

    // Difficulty breakdown
    const difficultyBreakdown = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    acceptedSubmissions.forEach(s => {
      if (s.difficulty && s.difficulty in difficultyBreakdown) {
        difficultyBreakdown[s.difficulty]++;
      }
    });

    // Language usage
    const languageUsage = {};
    allSubmissions.forEach(s => {
      languageUsage[s.language] = (languageUsage[s.language] || 0) + 1;
    });

    // Calculate success rate
    const successRate = allSubmissions.length > 0 
      ? ((acceptedSubmissions.length / allSubmissions.length) * 100).toFixed(2) 
      : 0;

    // Build response
    const response = {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        totalSubmissions: allSubmissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        uniqueProblems: uniqueProblems.size,
        successRate: parseFloat(successRate),
        difficultyBreakdown,
        languageUsage,
        lastSubmittedAt: allSubmissions.length > 0 ? allSubmissions[0].submittedAt : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching submission history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission history' },
      { status: 500 }
    );
  }
}
