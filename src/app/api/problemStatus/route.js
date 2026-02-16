import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db/connect";
import UserProblem from "../../../lib/db/models/UserProblem";
import jwt from "jsonwebtoken";

/**
 * GET /api/problemStatus
 * Returns problem statuses for the authenticated user
 * Response: { statuses: { "problem-id": "Solved" | "Attempted" | "Unsolved" } }
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ statuses: {} });
    }

    const token = authHeader.substring(7);
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ statuses: {} });
    }

    await connectToDatabase();
    const userProblems = await UserProblem.find({ userId }).select("problemId problemSlug status");

    const statuses = {};
    userProblems.forEach(({ problemId, problemSlug, status }) => {
      if (problemId) statuses[problemId] = status;
      if (problemSlug) statuses[problemSlug] = status;
    });

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Error fetching problem statuses:", error?.message || error);
    return NextResponse.json({ statuses: {} });
  }
}
