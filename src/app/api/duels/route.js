import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db/connect";
import DuelRoom from "../../../lib/db/models/DuelRoom";
import Problem from "../../../lib/db/models/Problem";
import { requireAuthenticatedUser } from "../../../lib/db/requestAuth";
import { getDuelStatus } from "../../../lib/duels/leaderboard";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MAX_PROBLEMS = 8;
const MAX_DURATION_MINUTES = 180;

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeProblems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { problemSlug: item.trim(), points: 1 };
      }

      return {
        problemSlug: String(item?.problemSlug || "").trim(),
        points: Math.max(1, Number(item?.points || 1)),
      };
    })
    .filter((item) => item.problemSlug);
}

async function validatePublicProblems(roomProblems) {
  const slugs = [...new Set(roomProblems.map((item) => item.problemSlug))];
  const docs = await Problem.find({ slug: { $in: slugs } })
    .select({ slug: 1, isPublic: 1, title: 1 })
    .lean();

  if (docs.length !== slugs.length) {
    const existing = new Set(docs.map((item) => item.slug));
    const missing = slugs.filter((slug) => !existing.has(slug));
    return { ok: false, error: `Problems not found: ${missing.join(", ")}` };
  }

  const privateProblems = docs.filter((item) => item.isPublic === false);
  if (privateProblems.length > 0) {
    return {
      ok: false,
      error: `1v1 rooms can only use public problems. Private problems provided: ${privateProblems
        .map((item) => item.slug)
        .join(", ")}`,
    };
  }

  return { ok: true, docs };
}

async function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const bytes = crypto.randomBytes(6);
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += alphabet[bytes[i] % alphabet.length];
    }

    const exists = await DuelRoom.findOne({ roomCode: code }).select({ _id: 1 }).lean();
    if (!exists) return code;
  }

  throw new Error("Unable to generate unique room code");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = String(searchParams.get("status") || "").trim();
    const query = {};

    if (statusFilter) {
      query.status = statusFilter;
    }

    await connectToDatabase();

    const rooms = await DuelRoom.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const items = rooms.map((room) => {
      const computedStatus = getDuelStatus(room);
      const start = room.startedAt ? new Date(room.startedAt).toISOString() : null;
      const end = room.endedAt
        ? new Date(room.endedAt).toISOString()
        : room.startedAt
          ? new Date(
              new Date(room.startedAt).getTime() + Number(room.durationMinutes || 60) * 60000
            ).toISOString()
          : null;

      return {
        roomCode: room.roomCode,
        title: room.title,
        status: computedStatus,
        durationMinutes: room.durationMinutes,
        startedAt: start,
        endedAt: end,
        createdAt: room.createdAt,
        problemCount: Array.isArray(room.problems) ? room.problems.length : 0,
        isPrivate: room.isPrivate === true,
        hasGuest: Boolean(room.guestUserId),
      };
    });

    return NextResponse.json({ rooms: items });
  } catch (error) {
    console.error("Failed to fetch duel rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = await request.json();

    const title = String(payload.title || "").trim();
    const normalizedProblems = normalizeProblems(payload.problems || []);
    const durationMinutes = Math.min(
      MAX_DURATION_MINUTES,
      Math.max(10, Number(payload.durationMinutes || 60))
    );
    const password = String(payload.password || "").trim();

    if (normalizedProblems.length === 0) {
      return NextResponse.json({ error: "At least one problem is required" }, { status: 400 });
    }

    if (normalizedProblems.length > MAX_PROBLEMS) {
      return NextResponse.json(
        { error: `No more than ${MAX_PROBLEMS} problems are allowed` },
        { status: 400 }
      );
    }

    if (Number(payload.durationMinutes) > MAX_DURATION_MINUTES) {
      return NextResponse.json(
        { error: "Duration cannot exceed 180 minutes" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const uniqueProblems = [];
    const seen = new Set();
    normalizedProblems.forEach((item) => {
      if (seen.has(item.problemSlug)) return;
      seen.add(item.problemSlug);
      uniqueProblems.push(item);
    });

    const validation = await validatePublicProblems(uniqueProblems);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const roomCode = await generateRoomCode();
    const passwordHash = password ? await bcrypt.hash(password, 10) : "";

    const created = await DuelRoom.create({
      roomCode,
      title: title || `Room ${roomCode}`,
      hostUserId: auth.userId,
      guestUserId: null,
      problems: uniqueProblems,
      durationMinutes,
      isPrivate: Boolean(password),
      passwordHash,
      status: "waiting",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        room: {
          roomCode: created.roomCode,
          title: created.title,
          status: created.status,
          durationMinutes: created.durationMinutes,
          problemCount: created.problems.length,
          isPrivate: created.isPrivate === true,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create duel room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
