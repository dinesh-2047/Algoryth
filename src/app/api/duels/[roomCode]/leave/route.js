import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import DuelRoom from "../../../../../lib/db/models/DuelRoom";
import { requireAuthenticatedUser } from "../../../../../lib/db/requestAuth";

export async function POST(request, { params }) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { roomCode } = await params;
    const userId = String(auth.userId);

    await connectToDatabase();

    const room = await DuelRoom.findOne({ roomCode: String(roomCode).trim() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }


    const isHost = String(room.hostUserId) === userId;
    const isGuest = room.guestUserId && String(room.guestUserId) === userId;

    // If the room already ended, allow the client to 'leave' without modifying DB.
    if (room.status === "ended") {
      return NextResponse.json({ message: "Room already ended" });
    }

    // For non-ended rooms, only members may call leave.
    if (!isHost && !isGuest) {
      return NextResponse.json({ error: "You are not a member of this room" }, { status: 403 });
    }

    if (isGuest) {
      room.guestUserId = null;
      // If match was live and guest leaves, cancel the room.
      if (room.status === "live") {
        room.status = "canceled";
        room.endedAt = room.endedAt || new Date();
      }
    }

    if (isHost) {
      room.guestUserId = null;
      // Only cancel if the duel hasn't already ended.
      if (room.status !== "ended") {
        room.status = "canceled";
        room.endedAt = room.endedAt || new Date();
      }
    }

    room.updatedAt = new Date();
    await room.save();

    return NextResponse.json({
      message: "Left room",
      roomCode: room.roomCode,
      status: room.status,
    });
  } catch (error) {
    console.error("Failed to leave duel room:", error);
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 });
  }
}