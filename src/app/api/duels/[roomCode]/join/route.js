import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import DuelRoom from "../../../../../lib/db/models/DuelRoom";
import { requireAuthenticatedUser } from "../../../../../lib/db/requestAuth";
import bcrypt from "bcryptjs";

export async function POST(request, { params }) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { roomCode } = await params;
    const payload = await request.json().catch(() => ({}));
    const password = String(payload.password || "").trim();

    await connectToDatabase();

    const room = await DuelRoom.findOne({ roomCode: String(roomCode).trim() });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Room already started or ended" },
        { status: 400 }
      );
    }

    const userId = String(auth.userId);
    if (String(room.hostUserId) === userId) {
      return NextResponse.json({ message: "Host already in room" });
    }

    if (room.guestUserId && String(room.guestUserId) !== userId) {
      return NextResponse.json({ error: "Room already has an opponent" }, { status: 409 });
    }

    if (room.isPrivate) {
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 403 });
      }

      const ok = await bcrypt.compare(password, room.passwordHash || "");
      if (!ok) {
        return NextResponse.json({ error: "Invalid password" }, { status: 403 });
      }
    }

    if (!room.guestUserId) {
      room.guestUserId = auth.userId;
      room.updatedAt = new Date();
      await room.save();
    }

    return NextResponse.json({ message: "Joined room", roomCode: room.roomCode });
  } catch (error) {
    console.error("Failed to join duel room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
