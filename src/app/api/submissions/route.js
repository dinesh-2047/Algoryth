import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";
import { connectToDatabase } from "../../../lib/db/connect";
import Submission from "../../../lib/db/models/Submission";
import User from "../../../lib/db/models/User";
import { verifyToken } from "../../../lib/db/middleware";
import { checkAndAwardBadges } from "../../../lib/db/badges/badgeUtils";

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { slug, code, language = 'javascript' } = await request.json();
    
    // Get user ID from JWT token
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { valid, decoded } = verifyToken(token);
        if (valid) {
          userId = decoded.userId;
        }
      }
    }

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
    let executionTime = 0;
    let verdict = "Error";
    let error = null;

    try {
      // User must define solve(input)
      userFunction = new Function(
        `${code}; return solve;`
      )();
    } catch (err) {
      verdict = "Compilation Error";
      error = err.toString();

      // Save failed compilation submission to database
      if (userId) {
        try {
          await connectToDatabase();
          
          const submission = new Submission({
            userId,
            problemSlug: slug,
            problemId: problem.id,
            problemTitle: problem.title,
            code,
            language,
            verdict,
            difficulty: problem.difficulty,
            submittedAt: new Date(),
          });
          
          await submission.save();
          
          // Update user stats for failed submission
          await updateUserStatsOnSubmission(userId, verdict, slug);
        } catch (dbError) {
          console.error('Error saving compilation error to database:', dbError);
        }
      }
      
      return NextResponse.json({
        verdict,
        error,
        verdict: "Compilation Error",
        error: err.toString(),
      });
    }

    // Run test cases and measure execution time
    const testStartTime = Date.now();
    for (const test of problem.testCases) {
      let userOutput;

      try {
        userOutput = userFunction(JSON.parse(test.input));
      } catch (err) {
        verdict = "Runtime Error";
        error = err.toString();
        
        // Save runtime error submission
        // Save Runtime Error to database
        if (userId) {
          try {
            await connectToDatabase();
            
            const submission = new Submission({
              userId,
              problemSlug: slug,
              problemId: problem.id,
              problemTitle: problem.title,
              code,
              language,
              verdict,
              difficulty: problem.difficulty,
              executionTime: Date.now() - testStartTime,
              verdict: "Runtime Error",
              difficulty: problem.difficulty,
              submittedAt: new Date(),
            });
            
            await submission.save();
            await updateUserStatsOnSubmission(userId, verdict, slug);
          } catch (dbError) {
            console.error('Error saving runtime error to database:', dbError);
          }
        }

        
        return NextResponse.json({
          verdict,
          error,
        });
      }

      const expected = JSON.stringify(
        JSON.parse(test.output)
      );

      const actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        verdict = "Wrong Answer";
        executionTime = Date.now() - testStartTime;

        // Save wrong answer submission
        // Save Wrong Answer to database
        if (userId) {
          try {
            await connectToDatabase();
            
            const submission = new Submission({
              userId,
              problemSlug: slug,
              problemId: problem.id,
              problemTitle: problem.title,
              code,
              language,
              verdict,
              difficulty: problem.difficulty,
              executionTime,
              verdict: "Wrong Answer",
              difficulty: problem.difficulty,
              submittedAt: new Date(),
            });
            
            await submission.save();
            await updateUserStatsOnSubmission(userId, verdict, slug);
          } catch (dbError) {
            console.error('Error saving wrong answer to database:', dbError);
          }
        }

        
        return NextResponse.json({
          verdict,
          expected,
          actual,
        });
      }
    }

    // All tests passed - Accepted
    verdict = "Accepted";
    executionTime = Date.now() - startTime;

    // Save accepted submission to database and check badges
    const badgeResult = { newBadges: [] };
    
    // Save submission to database if user is authenticated
    if (userId) {
      try {
        await connectToDatabase();
        
        const submission = new Submission({
          userId,
          problemSlug: slug,
          problemId: problem.id,
          problemTitle: problem.title,
          code,
          language,
          verdict,
          difficulty: problem.difficulty,
          executionTime,
          verdict: "Accepted",
          difficulty: problem.difficulty,
          submittedAt: new Date(),
        });
        
        await submission.save();

        // Update user stats and get new badges
        await updateUserStatsOnSubmission(userId, verdict, slug);
        const badgeCheckResult = await checkAndAwardBadges(userId);
        badgeResult.newBadges = badgeCheckResult.newBadges || [];
      } catch (dbError) {
        console.error('Error saving accepted submission to database:', dbError);
      }
    }

    return NextResponse.json({
      verdict,
      executionTime,
      newBadges: badgeResult.newBadges,
    });
  } catch (err) {
    console.error('Submission error:', err);
    return NextResponse.json(
      { verdict: "Error", message: "Invalid request" },
      { status: 400 }
    );
  }
}

/**
 * Update user statistics after each submission
 * Tracks: total submissions, accepted count, streak, acceptance rate, language usage
 * @param {string} userId - MongoDB user ID
 * @param {string} verdict - Submission verdict
 */
async function updateUserStatsOnSubmission(userId, verdict, problemSlug) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date().toDateString();
    const lastSubmissionDay = user.lastSubmissionDate?.toDateString();
    
    // Initialize or increment stats
    const updates = {
      totalSubmissions: user.totalSubmissions + 1,
      totalAcceptedCount: user.totalAcceptedCount, // Initialize before conditional to avoid NaN
      updatedAt: new Date(),
    };

    // Update streak logic
    if (verdict === 'Accepted') {
      updates.totalAcceptedCount = user.totalAcceptedCount + 1;

      // Check if this is first-try (no prior submissions for this specific problem)
      const existingSubmissions = await Submission.countDocuments({
        userId,
        problemSlug, // Scope to current problem only
      });

      // If this is the only submission for this problem (first-try), increment count
      if (existingSubmissions === 1) {
        updates.perfectAcceptanceCount = user.perfectAcceptanceCount + 1;
      }
    }

    // Streak tracking
    if (lastSubmissionDay !== today) {
      // New day - check if streak continues or resets
      const lastDate = user.lastSubmissionDate || new Date();
      const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day - increment streak
        updates.streakCount = user.streakCount + 1;
        updates.longestStreak = Math.max(user.longestStreak, updates.streakCount);
      } else if (daysDiff > 1) {
        // Streak broken - reset
        updates.streakCount = 1;
      } else {
        // Same day - don't change streak
        updates.streakCount = user.streakCount;
      }
    } else {
      // Same day submission - keep streak as is
      updates.streakCount = user.streakCount;
    }

    updates.lastSubmissionDate = new Date();

    // Update acceptance rate
    if (updates.totalSubmissions > 0) {
      updates.acceptanceRate = Math.round(
        (updates.totalAcceptedCount / updates.totalSubmissions) * 100
      );
    }

    // Update user
    await User.findByIdAndUpdate(userId, updates);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

/**
 * GET /api/submissions
 * Get user's recent submissions (with pagination)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Get user ID from JWT token
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
    
    const submissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-__v');

    const total = await Submission.countDocuments({ userId });

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
