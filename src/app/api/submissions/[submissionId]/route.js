import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../lib/db/connect";
import Submission from "../../../../lib/db/models/Submission";
import { verifyToken } from "../../../../lib/db/middleware";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { submissionId } = resolvedParams;

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid authorization header" }, { status: 401 });
    }

    const { valid, decoded } = verifyToken(token);
    if (!valid || !decoded?.userId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await connectToDatabase();

    const submission = await Submission.findOne({
      _id: submissionId,
      userId: decoded.userId,
    }).lean();

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching submission detail:", error);
    return NextResponse.json({ error: "Failed to fetch submission detail" }, { status: 500 });
  }
}
