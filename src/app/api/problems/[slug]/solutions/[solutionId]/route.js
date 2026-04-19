import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db/connect";
import { requireAuthenticatedUser } from "../../../../../../lib/db/requestAuth";
import Solution from "../../../../../../lib/db/models/Solution";

function canModifySolution(solution, auth) {
  const ownerId = String(solution.userId);
  return ownerId === auth.userId || auth.user.role === "admin";
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { solutionId } = await params;
    const payload = await request.json();

    await connectToDatabase();

    const existing = await Solution.findById(solutionId);
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    if (!canModifySolution(existing, auth)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = {};

    if (payload.title !== undefined) {
      const title = String(payload.title || "").trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updates.title = title;
    }

    if (payload.summary !== undefined) {
      updates.summary = String(payload.summary || "").trim();
    }

    if (payload.code !== undefined) {
      const code = String(payload.code || "");
      if (!code.trim()) {
        return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 });
      }
      updates.code = code;
    }

    if (payload.language !== undefined) {
      updates.language = String(payload.language || "javascript").toLowerCase();
    }

    updates.updatedAt = new Date();

    const updated = await Solution.findByIdAndUpdate(solutionId, { $set: updates }, { new: true }).lean();

    return NextResponse.json({
      message: "Solution updated",
      solution: {
        id: updated._id,
        title: updated.title,
        summary: updated.summary,
        code: updated.code,
        language: updated.language,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update solution:", error);
    return NextResponse.json({ error: "Failed to update solution" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { solutionId } = await params;

    await connectToDatabase();

    const existing = await Solution.findById(solutionId);
    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    if (!canModifySolution(existing, auth)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Solution.findByIdAndUpdate(solutionId, {
      $set: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Solution removed" });
  } catch (error) {
    console.error("Failed to delete solution:", error);
    return NextResponse.json({ error: "Failed to delete solution" }, { status: 500 });
  }
}
