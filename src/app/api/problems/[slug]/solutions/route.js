import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import { getProblemBySlug } from "../../../../../lib/problem-store";
import { requireAuthenticatedUser } from "../../../../../lib/db/requestAuth";
import Solution from "../../../../../lib/db/models/Solution";
import Submission from "../../../../../lib/db/models/Submission";

async function canAccessProblem(slug, request) {
  const problem = await getProblemBySlug(slug, { includePrivate: true });
  if (!problem) return { ok: false, status: 404, error: "Problem not found" };

  if (problem.isPublic) {
    return { ok: true, problem, isAdmin: false };
  }

  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok || auth.user.role !== "admin") {
    return { ok: false, status: 404, error: "Problem not found" };
  }

  return { ok: true, problem, isAdmin: true, user: auth.user };
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const access = await canAccessProblem(slug, request);

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    await connectToDatabase();

    const solutions = await Solution.find({
      problemSlug: slug,
      isDeleted: false,
    })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      solutions: solutions.map((item) => ({
        id: item._id,
        problemSlug: item.problemSlug,
        userId: String(item.userId),
        authorName: item.authorName,
        language: item.language,
        title: item.title,
        summary: item.summary,
        code: item.code,
        upvotes: item.upvotes || 0,
        runtimeMs: item.runtimeMs,
        memoryKb: item.memoryKb,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch solutions:", error);
    return NextResponse.json({ error: "Failed to fetch solutions" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const auth = await requireAuthenticatedUser(request);

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const access = await canAccessProblem(slug, request);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const payload = await request.json();
    const title = String(payload.title || "").trim();
    const summary = String(payload.summary || "").trim();
    const code = String(payload.code || "");
    const language = String(payload.language || "javascript").toLowerCase();

    if (!title || !code.trim()) {
      return NextResponse.json(
        { error: "Title and code are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bestAccepted = await Submission.findOne({
      userId: auth.userId,
      problemSlug: slug,
      verdict: "Accepted",
    })
      .sort({ executionTime: 1, memoryUsage: 1, submittedAt: -1 })
      .lean();

    const solution = await Solution.create({
      problemSlug: slug,
      userId: auth.userId,
      authorName: auth.user.name || auth.user.email,
      language,
      title,
      summary,
      code,
      runtimeMs: bestAccepted ? Number(bestAccepted.executionTime || 0) : null,
      memoryKb: bestAccepted ? Number(bestAccepted.memoryUsage || 0) : null,
    });

    return NextResponse.json(
      {
        message: "Solution posted successfully",
        solution: {
          id: solution._id,
          problemSlug: solution.problemSlug,
          userId: String(solution.userId),
          authorName: solution.authorName,
          language: solution.language,
          title: solution.title,
          summary: solution.summary,
          code: solution.code,
          runtimeMs: solution.runtimeMs,
          memoryKb: solution.memoryKb,
          upvotes: solution.upvotes,
          createdAt: solution.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to post solution:", error);
    return NextResponse.json({ error: "Failed to post solution" }, { status: 500 });
  }
}
