import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "../../../../lib/db/requestAuth";

export async function GET(request) {
  try {
    const auth = await requireAuthenticatedUser(request);

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    return NextResponse.json({
      user: {
        id: auth.user._id,
        name: auth.user.name,
        email: auth.user.email,
        role: auth.user.role || "user",
        rating: auth.user.rating || 1200,
        streakCount: auth.user.streakCount || 0,
        longestStreak: auth.user.longestStreak || 0,
        contestsPlayed: auth.user.contestsPlayed || 0,
        contestRatingHistory: auth.user.contestRatingHistory || [],
        createdAt: auth.user.createdAt,
        updatedAt: auth.user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
