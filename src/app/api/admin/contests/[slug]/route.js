import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import Problem from "../../../../../lib/db/models/Problem";
import Contest from "../../../../../lib/db/models/Contest";
import { requireAdminUser } from "../../../../../lib/db/requestAuth";

function normalizeContestProblems(raw) {
  if (raw === undefined) return undefined;
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

async function validatePrivateProblems(contestProblems) {
  const slugs = [...new Set(contestProblems.map((item) => item.problemSlug))];
  const docs = await Problem.find({ slug: { $in: slugs } })
    .select({ slug: 1, isPublic: 1 })
    .lean();

  if (docs.length !== slugs.length) {
    const existing = new Set(docs.map((item) => item.slug));
    const missing = slugs.filter((slug) => !existing.has(slug));
    return { ok: false, error: `Problems not found: ${missing.join(", ")}` };
  }

  const publicProblems = docs.filter((item) => item.isPublic !== false);
  if (publicProblems.length > 0) {
    return {
      ok: false,
      error: `Contests can only use private problems. Public problems provided: ${publicProblems
        .map((item) => item.slug)
        .join(", ")}`,
    };
  }

  return { ok: true };
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;

    await connectToDatabase();

    const contest = await Contest.findOne({ slug }).lean();
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    return NextResponse.json({ contest });
  } catch (error) {
    console.error("Failed to fetch contest:", error);
    return NextResponse.json({ error: "Failed to fetch contest" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;
    const payload = await request.json();

    const updates = {};

    if (payload.title !== undefined) updates.title = String(payload.title || "").trim();
    if (payload.description !== undefined) updates.description = String(payload.description || "");
    if (payload.startTime !== undefined) updates.startTime = new Date(payload.startTime);
    if (payload.endTime !== undefined) updates.endTime = new Date(payload.endTime);
    if (payload.durationMinutes !== undefined) {
      updates.durationMinutes = Math.max(10, Number(payload.durationMinutes || 90));
    }
    if (payload.isPublic !== undefined) updates.isPublic = payload.isPublic === true;
    if (payload.isRated !== undefined) updates.isRated = payload.isRated === true;

    const normalizedProblems = normalizeContestProblems(payload.problems || payload.problemSlugs);
    if (normalizedProblems !== undefined) {
      if (normalizedProblems.length === 0) {
        return NextResponse.json(
          { error: "At least one contest problem is required" },
          { status: 400 }
        );
      }

      await connectToDatabase();
      const validation = await validatePrivateProblems(normalizedProblems);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      updates.problems = normalizedProblems;
    }

    updates.updatedAt = new Date();

    await connectToDatabase();

    const updated = await Contest.findOneAndUpdate({ slug }, { $set: updates }, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Contest updated", contest: updated });
  } catch (error) {
    console.error("Failed to update contest:", error);
    return NextResponse.json({ error: "Failed to update contest" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;

    await connectToDatabase();

    const deleted = await Contest.findOneAndDelete({ slug }).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Contest deleted" });
  } catch (error) {
    console.error("Failed to delete contest:", error);
    return NextResponse.json({ error: "Failed to delete contest" }, { status: 500 });
  }
}
