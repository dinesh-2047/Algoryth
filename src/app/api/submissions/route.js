import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db/connect";
import Submission from "../../../lib/db/models/Submission";
import User from "../../../lib/db/models/User";
import { verifyToken } from "../../../lib/db/middleware";
import { checkAndAwardBadges } from "../../../lib/db/badges/badgeUtils";
import { getProblemBySlug, recordProblemSubmission } from "../../../lib/problem-store";
import { enqueueExecution } from "../../../lib/execution/executionQueue";
import { OnlineCompilerError, runCodeSync } from "../../../lib/execution/onlineCompiler";
import Contest from "../../../lib/db/models/Contest";

function getAuthenticatedUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const { valid, decoded } = verifyToken(token);
  if (!valid || !decoded?.userId) return null;

  return decoded.userId;
}

function normalizeOutput(output) {
  return String(output ?? "").replace(/\r\n/g, "\n");
}

function normalizeTrimmed(output) {
  return normalizeOutput(output).trim();
}

function compareOutput(actualOutput, expectedOutput, comparison = "trimmed") {
  const normalizedActual = normalizeOutput(actualOutput);
  const normalizedExpected = normalizeOutput(expectedOutput);

  if (comparison === "exact") {
    return normalizedActual === normalizedExpected;
  }

  if (comparison === "tokens") {
    const actualTokens = normalizeTrimmed(normalizedActual).split(/\s+/).filter(Boolean);
    const expectedTokens = normalizeTrimmed(normalizedExpected).split(/\s+/).filter(Boolean);

    if (actualTokens.length !== expectedTokens.length) return false;

    return actualTokens.every((token, index) => token === expectedTokens[index]);
  }

  return normalizeTrimmed(normalizedActual) === normalizeTrimmed(normalizedExpected);
}

function classifyCompilerFailure(runResult, testCase) {
  const timeLimit = Number(testCase.maxTimeMs || 3000);
  const memoryLimit = Number(testCase.maxMemoryKb || 262144);

  if (runResult.exitCode === 124 || runResult.timeMs > timeLimit) {
    return "Time Limit Exceeded";
  }

  if (
    (runResult.exitCode === 137 && runResult.signal === 9) ||
    (runResult.memoryKb > 0 && runResult.memoryKb > memoryLimit)
  ) {
    return "Memory Limit Exceeded";
  }

  if (runResult.status === "error" || (runResult.exitCode !== null && runResult.exitCode !== 0)) {
    const errorText = String(runResult.error || "").toLowerCase();

    if (
      errorText.includes("compile") ||
      errorText.includes("compilation") ||
      errorText.includes("syntax") ||
      errorText.includes("cannot find")
    ) {
      return "Compilation Error";
    }

    return "Runtime Error";
  }

  return null;
}

async function updateUserStatsOnSubmission({
  userId,
  verdict,
  language,
  priorSubmissionsForProblem,
}) {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const lastSubmissionDate = user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : null;
  if (lastSubmissionDate) {
    lastSubmissionDate.setHours(0, 0, 0, 0);
  }

  const lastSolvedDate = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
  if (lastSolvedDate) {
    lastSolvedDate.setHours(0, 0, 0, 0);
  }

  const totalSubmissions = (user.totalSubmissions || 0) + 1;
  const totalAcceptedCount =
    verdict === "Accepted" ? (user.totalAcceptedCount || 0) + 1 : user.totalAcceptedCount || 0;

  let streakCount = user.streakCount || 0;
  let longestStreak = user.longestStreak || 0;
  let nextLastSolvedDate = user.lastSolvedDate || null;

  // Streak is based on days with accepted solves, not attempts.
  if (verdict === "Accepted") {
    if (!lastSolvedDate) {
      streakCount = 1;
    } else {
      const dayDiff = Math.floor((today - lastSolvedDate) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        streakCount += 1;
      } else if (dayDiff > 1) {
        streakCount = 1;
      }
      // dayDiff === 0 keeps current streak unchanged.
    }

    longestStreak = Math.max(longestStreak, streakCount);
    nextLastSolvedDate = now;
  }

  let perfectAcceptanceCount = user.perfectAcceptanceCount || 0;
  if (verdict === "Accepted" && priorSubmissionsForProblem === 0) {
    perfectAcceptanceCount += 1;
  }

  const currentLanguages = Array.isArray(user.practiceLanguages) ? user.practiceLanguages : [];
  const nextLanguages = currentLanguages.includes(language)
    ? currentLanguages
    : [...currentLanguages, language];

  const acceptanceRate =
    totalSubmissions > 0
      ? Number(((totalAcceptedCount / totalSubmissions) * 100).toFixed(2))
      : 0;

  await User.findByIdAndUpdate(userId, {
    totalSubmissions,
    totalAcceptedCount,
    perfectAcceptanceCount,
    acceptanceRate,
    streakCount,
    longestStreak,
    lastSubmissionDate: now,
    lastSolvedDate: nextLastSolvedDate,
    practiceLanguages: nextLanguages,
    updatedAt: now,
  });
}

export async function POST(request) {
  const startedAt = Date.now();

  try {
    const { slug, code, language = "javascript", contestSlug } = await request.json();
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          verdict: "Error",
          message: "Login required to submit solutions",
        },
        { status: 401 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { verdict: "Error", message: "Problem slug is required" },
        { status: 400 }
      );
    }

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { verdict: "Error", message: "Code cannot be empty" },
        { status: 400 }
      );
    }

    let includePrivate = false;
    if (contestSlug && process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const contest = await Contest.findOne({ slug: contestSlug, isPublic: true })
          .select({ startTime: 1, problems: 1 })
          .lean();

        if (contest) {
          const now = Date.now();
          const start = new Date(contest.startTime).getTime();
          const includesProblem = (contest.problems || []).some(
            (item) => item.problemSlug === slug
          );

          if (includesProblem && now >= start) {
            includePrivate = true;
          }
        }
      } catch (contestError) {
        console.error("Contest access validation failed for submission:", contestError);
      }
    }

    const problem = await getProblemBySlug(slug, {
      includeTestCases: true,
      includePrivate,
    });

    if (!problem) {
      return NextResponse.json(
        { verdict: "Error", message: "Problem not found" },
        { status: 404 }
      );
    }

    if (!Array.isArray(problem.testCases) || problem.testCases.length < 10) {
      return NextResponse.json(
        {
          verdict: "Error",
          message: "Problem test cases are not configured correctly",
        },
        { status: 500 }
      );
    }

    let verdict = "Accepted";
    let testsPassed = 0;
    const totalTests = problem.testCases.length;
    let executionTime = 0;
    let memoryUsage = 0;
    let queueWaitMs = 0;
    let failedCase = null;
    let errorMessage = "";

    for (let index = 0; index < problem.testCases.length; index += 1) {
      const testCase = problem.testCases[index];

      let runResult;
      try {
        runResult = await enqueueExecution(() =>
          runCodeSync({
            code,
            language,
            input: testCase.input,
          })
        );
      } catch (error) {
        if (error instanceof OnlineCompilerError) {
          verdict = error.statusCode === 429 ? "Error" : "Compilation Error";
          errorMessage = error.message;
          failedCase = {
            index: index + 1,
            name: testCase.name,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "",
            reason: error.message,
          };
          break;
        }

        throw error;
      }

      executionTime += Number(runResult.timeMs || 0);
      memoryUsage = Math.max(memoryUsage, Number(runResult.memoryKb || 0));
      queueWaitMs += Number(runResult.queueWaitMs || 0);

      const compilerVerdict = classifyCompilerFailure(runResult, testCase);
      if (compilerVerdict) {
        verdict = compilerVerdict;
        errorMessage = runResult.error || "Execution failed";
        failedCase = {
          index: index + 1,
          name: testCase.name,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: runResult.output,
          reason: compilerVerdict,
        };
        break;
      }

      const outputMatches = compareOutput(
        runResult.output,
        testCase.expectedOutput,
        testCase.comparison
      );

      if (!outputMatches) {
        const normalizedOutput = normalizeTrimmed(runResult.output);
        const normalizedExpected = normalizeTrimmed(testCase.expectedOutput);

        if (normalizedOutput.length >= 999 && normalizedExpected.length < 999) {
          verdict = "Output Limit Exceeded";
        } else {
          verdict = "Wrong Answer";
        }

        errorMessage = verdict;

        failedCase = {
          index: index + 1,
          name: testCase.name,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: runResult.output,
          reason: verdict,
        };
        break;
      }

      testsPassed += 1;
    }

    let newBadges = [];

    try {
      await connectToDatabase();

      const priorSubmissionsForProblem = await Submission.countDocuments({
        userId,
        problemSlug: slug,
      });

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
        memoryUsage,
        testsPassed,
        totalTests,
        queueWaitMs,
        failedTestName: failedCase?.name,
        failedTestIndex: failedCase?.index ?? null,
        failedTestInput: String(failedCase?.input || ""),
        failedExpectedOutput: String(failedCase?.expectedOutput || ""),
        failedActualOutput: String(failedCase?.actualOutput || ""),
        errorMessage,
        submittedAt: new Date(),
      });

      await submission.save();

      await updateUserStatsOnSubmission({
        userId,
        verdict,
        language,
        priorSubmissionsForProblem,
      });

      const badgeCheckResult = await checkAndAwardBadges(userId);
      newBadges = badgeCheckResult?.newBadges || [];
    } catch (dbError) {
      console.error("Error saving submission to database:", dbError);
    }

    await recordProblemSubmission(slug, verdict === "Accepted");

    return NextResponse.json({
      verdict,
      testsPassed,
      totalTests,
      executionTime,
      memoryUsage,
      queueWaitMs,
      failedCase,
      newBadges,
      totalElapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      {
        verdict: "Error",
        message: "Invalid submission request",
        details: error.message,
      },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit"), 10) || 10;
    const offset = parseInt(searchParams.get("offset"), 10) || 0;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { valid, decoded } = verifyToken(token);

    if (!valid || !decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = decoded.userId;

    const submissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(offset)
      .select("-__v");

    const total = await Submission.countDocuments({ userId });

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
