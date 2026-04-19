import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import Problem from "../../../../../lib/db/models/Problem";
import { requireAdminUser } from "../../../../../lib/db/requestAuth";

function normalizeArray(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExamples(items) {
  if (items === undefined) return undefined;
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
  if (items === undefined) return undefined;
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

export async function GET(request, { params }) {
  try {
    const auth = await requireAdminUser(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;

    await connectToDatabase();

    const problem = await Problem.findOne({ slug }).lean();
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
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

    if (payload.id !== undefined) updates.id = String(payload.id || "").trim();
    if (payload.title !== undefined) updates.title = String(payload.title || "").trim();
    if (payload.rating !== undefined) updates.rating = Number(payload.rating || 1200);
    if (payload.difficulty !== undefined) updates.difficulty = payload.difficulty;
    if (payload.statement !== undefined) updates.statement = String(payload.statement || "");
    if (payload.inputFormat !== undefined) updates.inputFormat = String(payload.inputFormat || "");
    if (payload.outputFormat !== undefined) {
      updates.outputFormat = String(payload.outputFormat || "");
    }

    const tags = normalizeArray(payload.tags);
    if (tags !== undefined) updates.tags = tags;

    const constraints = normalizeArray(payload.constraints);
    if (constraints !== undefined) updates.constraints = constraints;

    const hints = normalizeArray(payload.hints);
    if (hints !== undefined) updates.hints = hints;

    const examples = normalizeExamples(payload.examples);
    if (examples !== undefined) updates.examples = examples;

    const testCases = normalizeTestCases(payload.testCases);
    if (testCases !== undefined) {
      if (testCases.length < 10) {
        return NextResponse.json(
          { error: "At least 10 test cases are required" },
          { status: 400 }
        );
      }
      updates.testCases = testCases;
    }

    if (payload.starterCode !== undefined) updates.starterCode = payload.starterCode || {};
    if (payload.isPublic !== undefined) updates.isPublic = payload.isPublic === true;

    if (payload.editorial !== undefined) {
      updates.editorial = {
        title: String(payload.editorial?.title || ""),
        content: String(payload.editorial?.content || ""),
        updatedBy: auth.userId,
        updatedAt: payload.editorial?.content ? new Date() : null,
      };
    }

    updates.updatedAt = new Date();

    await connectToDatabase();

    const updated = await Problem.findOneAndUpdate({ slug }, { $set: updates }, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Problem updated", problem: updated });
  } catch (error) {
    console.error("Failed to update problem:", error);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
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

    const deleted = await Problem.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Problem deleted" });
  } catch (error) {
    console.error("Failed to delete problem:", error);
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}
