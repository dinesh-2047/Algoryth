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

    await connectToDatabase();

    const room = await DuelRoom.findOne({ roomCode: String(roomCode).trim() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (String(room.hostUserId) !== String(auth.userId)) {
      return NextResponse.json({ error: "Only the host can start the room" }, { status: 403 });
    }

    if (!room.guestUserId) {
      return NextResponse.json({ error: "Opponent has not joined yet" }, { status: 400 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room already started" }, { status: 400 });
    }

    const startedAt = new Date();
    const endedAt = new Date(
      startedAt.getTime() + Number(room.durationMinutes || 60) * 60000
    );

    room.status = "live";
    room.startedAt = startedAt;
    room.endedAt = endedAt;
    room.updatedAt = new Date();
    await room.save();

    return NextResponse.json({
      message: "Room started",
      startedAt,
      endedAt,
    });
  } catch (error) {
    console.error("Failed to start duel room:", error);
    return NextResponse.json({ error: "Failed to start room" }, { status: 500 });
  }
}
