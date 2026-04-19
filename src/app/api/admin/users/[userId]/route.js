import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import User from "../../../../../lib/db/models/User";
import Submission from "../../../../../lib/db/models/Submission";
import Solution from "../../../../../lib/db/models/Solution";
import { requireAdminUser } from "../../../../../lib/db/requestAuth";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = await params;
    const payload = await request.json();

    await connectToDatabase();

    const updates = {};
    if (payload.name !== undefined) updates.name = String(payload.name || "").trim();
    if (payload.email !== undefined) updates.email = String(payload.email || "").trim().toLowerCase();
    if (payload.role !== undefined) updates.role = payload.role === "admin" ? "admin" : "user";
    if (payload.rating !== undefined) updates.rating = Number(payload.rating || 1200);
    if (payload.streakCount !== undefined) updates.streakCount = Math.max(0, Number(payload.streakCount || 0));
    if (payload.longestStreak !== undefined) {
      updates.longestStreak = Math.max(0, Number(payload.longestStreak || 0));
    }

    updates.updatedAt = new Date();

    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true })
      .select("-password")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated", user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = await params;

    if (String(auth.userId) === String(userId)) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await User.findByIdAndDelete(userId).lean();
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Promise.all([
      Submission.deleteMany({ userId }),
      Solution.deleteMany({ userId }),
    ]);

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
