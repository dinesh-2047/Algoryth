import { NextResponse } from "next/server";
import { getProblemBySlug } from "../../../lib/problems";
import { connectToDatabase } from "../../../lib/db/connect";
import UserProblem from "../../../lib/db/models/UserProblem";
import jwt from "jsonwebtoken";

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

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ verdict: "Error", message: "Missing problem slug" }, { status: 400 });
    }
    if (!code || !code.toString().trim()) {
      return NextResponse.json({ verdict: "Error", message: "Empty code" }, { status: 400 });
    }

    const problem = getProblemBySlug(slug);
    if (!problem) {
      return NextResponse.json({ verdict: "Error", message: "Problem not found" }, { status: 404 });
    }

    // Accept either `testCases` or `examples` from the problem definition
    const tests = (problem.testCases && problem.testCases.length ? problem.testCases : (problem.examples || []));
    if (!tests || tests.length === 0) {
      return NextResponse.json({ verdict: "Error", message: "No test cases available for this problem" }, { status: 404 });
    }

    // Try to obtain the submitted `solve` function
    let solveFn;
    try {
      // The user's code must export/define a `solve` function
      solveFn = new Function(`${code}; return solve;`)();
      if (typeof solveFn !== "function") {
        return NextResponse.json({ verdict: "Error", message: "Submitted code must define a `solve` function" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ verdict: "Runtime Error", error: e?.toString() || String(e) });
    }

    let verdict = "Accepted";
    let expected = null;
    let actual = null;
    let runtimeError = null;

    // Evaluate tests sequentially; stop on first failure but keep verdict for DB save
    for (const t of tests) {
      // parse input: if JSON, pass parsed value; otherwise pass raw string
      let inputValue;
      try {
        inputValue = JSON.parse(t.input);
      } catch {
        inputValue = t.input;
      }

      // run user solution
      let userOutput;
      try {
        userOutput = await Promise.resolve(solveFn(inputValue));
      } catch (e) {
        verdict = "Runtime Error";
        runtimeError = e?.toString() || String(e);
        break;
      }

      // normalize expected and actual for comparison and response
      try {
        expected = JSON.stringify(JSON.parse(t.output));
      } catch {
        expected = JSON.stringify(t.output);
      }

      actual = JSON.stringify(userOutput);

      if (actual !== expected) {
        verdict = "Wrong Answer";
        break;
      }
    }

    // If user is authenticated, attempt to save the submission (do not fail request on DB errors)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
        const userId = decoded?.userId;
        if (userId) {
          await connectToDatabase();

          let userProblem = await UserProblem.findOne({ userId, problemId: problem.id });
          if (!userProblem) {
            userProblem = new UserProblem({
              userId,
              problemId: problem.id,
              problemSlug: problem.slug,
              problemTitle: problem.title,
              status: verdict === "Accepted" ? "Solved" : "Attempted",
            });
          } else {
            if (verdict === "Accepted" && userProblem.status !== "Solved") {
              userProblem.status = "Solved";
              userProblem.solvedAt = new Date();
            } else if (verdict !== "Accepted" && userProblem.status === "Unsolved") {
              userProblem.status = "Attempted";
            }
          }

          userProblem.submissions = userProblem.submissions || [];
          userProblem.submissions.push({ code, language: "javascript", verdict, timestamp: new Date() });
          userProblem.lastSubmissionAt = new Date();
          await userProblem.save();
        }
      } catch (e) {
        // Keep the response simple; log minimal info for server-side debugging
        console.error("submissions: failed to save submission:", e?.message || e);
      }
    }

    // Prepare response
    const responseBody = { verdict };
    if (verdict === "Wrong Answer") {
      responseBody.expected = expected;
      responseBody.actual = actual;
    }
    if (verdict === "Runtime Error") {
      responseBody.error = runtimeError;
    }

    return NextResponse.json(responseBody);
  } catch (e) {
    return NextResponse.json({ verdict: "Error", message: "Invalid request", details: e?.toString?.() || String(e) }, { status: 400 });
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
