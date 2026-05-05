import { requireAuthenticatedUser } from "@/lib/db/requestAuth";
import DuelRoom from "@/lib/db/models/DuelRoom";
import { connectToDatabase } from "@/lib/db/connect";
import { getDuelStatus } from "@/lib/duels/leaderboard";

export async function POST(req, context) {
  try {
    const { roomCode } = await context.params;

    // Authenticate user
    const authResult = await requireAuthenticatedUser(req);
    if (!authResult.ok) {
      return Response.json({ error: authResult.error }, { status: authResult.status });
    }
    const user = authResult.user;

    // Connect to database
    await connectToDatabase();

    // Find the room
    const room = await DuelRoom.findOne({ roomCode });
    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is the host
    const hostId = String(room.hostUserId || room.host?._id || "");
    const userId = String(user.id || user._id || "");

    if (hostId !== userId) {
      return Response.json(
        { error: "Only the host can delete this room" },
        { status: 403 }
      );
    }

    // Only allow deletion if the duel has not actually started yet.
    const duelStatus = getDuelStatus(room);
    if (duelStatus !== "waiting") {
      return Response.json(
        { error: "Cannot delete a room that has been played. It is now in history." },
        { status: 400 }
      );
    }

    // Delete the room
    await DuelRoom.deleteOne({ roomCode });

    return Response.json({
      ok: true,
      message: "Room deleted successfully",
      roomCode,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return Response.json(
      { error: error.message || "Failed to delete room" },
      { status: 500 }
    );
  }
}
