import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db/connect";
import Problem from "../../../../lib/db/models/Problem";
import { requireAdminUser } from "../../../../lib/db/requestAuth";

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExamples(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      input: String(item?.input || ""),
      output: String(item?.output || ""),
      explanation: String(item?.explanation || ""),
    }))
    .filter((item) => item.input && item.output);
}

function normalizeTestCases(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({
      name: String(item?.name || `case-${index + 1}`),
      input: String(item?.input || ""),
      expectedOutput: String(item?.expectedOutput || ""),
      comparison: ["trimmed", "tokens", "exact"].includes(item?.comparison)
        ? item.comparison
        : "trimmed",
      isHidden: item?.isHidden !== false,
      maxTimeMs: Number(item?.maxTimeMs || 3000),
      maxMemoryKb: Number(item?.maxMemoryKb || 262144),
      weight: Math.max(1, Number(item?.weight || 1)),
    }))
    .filter((item) => item.input.length > 0);
}

export async function GET(request) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get("search") || "").trim();

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Failed to fetch admin problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
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
    const id = String(payload.id || `P-${Date.now()}`);
    const rating = Number(payload.rating || 1200);
    const difficulty = ["Easy", "Medium", "Hard"].includes(payload.difficulty)
      ? payload.difficulty
      : rating < 1300
        ? "Easy"
        : rating < 1900
          ? "Medium"
          : "Hard";

    const testCases = normalizeTestCases(payload.testCases);

    if (!title || !slug || !payload.statement) {
      return NextResponse.json(
        { error: "title, slug (or title), and statement are required" },
        { status: 400 }
      );
    }

    if (testCases.length < 10) {
      return NextResponse.json(
        { error: "At least 10 test cases are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const exists = await Problem.findOne({ $or: [{ slug }, { id }] }).lean();
    if (exists) {
      return NextResponse.json(
        { error: "Problem with same slug or id already exists" },
        { status: 409 }
      );
    }

    const created = await Problem.create({
      id,
      slug,
      title,
      rating,
      difficulty,
      tags: normalizeArray(payload.tags),
      statement: String(payload.statement || ""),
      inputFormat: String(payload.inputFormat || ""),
      outputFormat: String(payload.outputFormat || ""),
      constraints: normalizeArray(payload.constraints),
      examples: normalizeExamples(payload.examples),
      hints: normalizeArray(payload.hints),
      starterCode: payload.starterCode || {},
      testCases,
      isPublic: payload.isPublic !== false,
      editorial: {
        title: String(payload.editorial?.title || ""),
        content: String(payload.editorial?.content || ""),
        updatedBy: auth.userId,
        updatedAt: payload.editorial?.content ? new Date() : null,
      },
      createdBy: auth.userId,
    });

    return NextResponse.json(
      {
        message: "Problem created",
        problem: {
          id: created.id,
          slug: created.slug,
          title: created.title,
          isPublic: created.isPublic,
          difficulty: created.difficulty,
          rating: created.rating,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create problem:", error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}
