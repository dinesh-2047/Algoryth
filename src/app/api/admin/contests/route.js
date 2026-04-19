import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/connect";
import Problem from "../../../../lib/db/models/Problem";
import Contest from "../../../../lib/db/models/Contest";
import { requireAdminUser } from "../../../../lib/db/requestAuth";

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeContestProblems(raw) {
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
    .select({ slug: 1, isPublic: 1, title: 1 })
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

  return { ok: true, docs };
}

export async function GET(request) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();

    const contests = await Contest.find({})
      .sort({ startTime: -1 })
      .lean();

    return NextResponse.json({ contests });
  } catch (error) {
    console.error("Failed to fetch contests:", error);
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = await request.json();

    const title = String(payload.title || "").trim();
    const slug = toSlug(payload.slug || title);
    const description = String(payload.description || "");
    const startTime = new Date(payload.startTime || Date.now());
    const durationMinutes = Math.max(10, Number(payload.durationMinutes || 90));
    const endTime = payload.endTime
      ? new Date(payload.endTime)
      : new Date(startTime.getTime() + durationMinutes * 60000);
    const problems = normalizeContestProblems(payload.problems || payload.problemSlugs || []);

    if (!title || !slug || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "title, slug, startTime and endTime/duration are required" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json({ error: "endTime must be after startTime" }, { status: 400 });
    }

    if (problems.length === 0) {
      return NextResponse.json({ error: "At least one contest problem is required" }, { status: 400 });
    }

    await connectToDatabase();

    const uniqueProblemRefs = [];
    const seen = new Set();
    problems.forEach((item) => {
      if (seen.has(item.problemSlug)) return;
      seen.add(item.problemSlug);
      uniqueProblemRefs.push(item);
    });

    const validation = await validatePrivateProblems(uniqueProblemRefs);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existing = await Contest.findOne({ slug }).lean();
    if (existing) {
      return NextResponse.json({ error: "Contest slug already exists" }, { status: 409 });
    }

    const created = await Contest.create({
      title,
      slug,
      description,
      startTime,
      endTime,
      durationMinutes,
      problems: uniqueProblemRefs,
      isPublic: payload.isPublic !== false,
      isRated: payload.isRated !== false,
      createdBy: auth.userId,
    });

    return NextResponse.json(
      {
        message: "Contest created",
        contest: {
          id: created._id,
          slug: created.slug,
          title: created.title,
          startTime: created.startTime,
          endTime: created.endTime,
          durationMinutes: created.durationMinutes,
          isPublic: created.isPublic,
          problems: created.problems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create contest:", error);
    return NextResponse.json({ error: "Failed to create contest" }, { status: 500 });
  }
}
