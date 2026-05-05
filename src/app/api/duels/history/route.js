import { requireAuthenticatedUser } from "@/lib/db/requestAuth";
import DuelRoom from "@/lib/db/models/DuelRoom";
import { connectToDatabase } from "@/lib/db/connect";

export async function GET(req) {
  try {
    // Authenticate user
    const authResult = await requireAuthenticatedUser(req);
    if (!authResult.ok) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const user = authResult.user;

    // Connect to database
    await connectToDatabase();

    const userId = String(user.id || user._id || "");

    // Fetch all rooms where user was host or guest and status is ended/canceled
    const history = await DuelRoom.find({
      $or: [
        { hostUserId: user._id, status: { $in: ["ended", "canceled"] } },
        { guestUserId: user._id, status: { $in: ["ended", "canceled"] } },
      ],
    })
      .sort({ endedAt: -1 })
      .limit(50)
      .lean();

    // Transform rooms to include computed fields
    const transformedHistory = history.map((room) => ({
      ...room,
      isHost: String(room.hostUserId || room.host?._id || "") === userId,
      isGuest: String(room.guestUserId || room.guest?._id || "") === userId,
    }));

    return Response.json({
      ok: true,
      history: transformedHistory,
    });
  } catch (error) {
    console.error("Error fetching duel history:", error);
    return Response.json(
      { error: error.message || "Failed to fetch history" },
      { status: 500 }
    );
  }
}
