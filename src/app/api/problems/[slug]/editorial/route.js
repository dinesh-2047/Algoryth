import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db/connect";
import Problem from "../../../../../lib/db/models/Problem";
import { getProblemBySlug } from "../../../../../lib/problem-store";
import { requireAdminUser, requireAuthenticatedUser } from "../../../../../lib/db/requestAuth";

async function canReadProblem(request, slug) {
  const publicProblem = await getProblemBySlug(slug);
  if (publicProblem) return { ok: true, problem: publicProblem };

  const auth = await requireAuthenticatedUser(request);
  if (!auth.ok || auth.user.role !== "admin") {
    return { ok: false, status: 404, error: "Problem not found" };
  }

  const privateProblem = await getProblemBySlug(slug, { includePrivate: true });
  if (!privateProblem) {
    return { ok: false, status: 404, error: "Problem not found" };
  }

  return { ok: true, problem: privateProblem, admin: auth };
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const access = await canReadProblem(request, slug);

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const editorial = access.problem.editorial || {};

    return NextResponse.json({
      slug,
      editorial: {
        title: editorial.title || "",
        content: editorial.content || "",
        updatedAt: editorial.updatedAt || null,
        updatedBy: editorial.updatedBy || null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch editorial:", error);
    return NextResponse.json({ error: "Failed to fetch editorial" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdminUser(request);

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { slug } = await params;
    const { title = "", content = "" } = await request.json();

    await connectToDatabase();

    const updated = await Problem.findOneAndUpdate(
      { slug },
      {
        $set: {
          "editorial.title": String(title || "").trim(),
          "editorial.content": String(content || ""),
          "editorial.updatedBy": auth.userId,
          "editorial.updatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Editorial updated",
      editorial: {
        title: updated.editorial?.title || "",
        content: updated.editorial?.content || "",
        updatedAt: updated.editorial?.updatedAt || null,
        updatedBy: updated.editorial?.updatedBy || null,
      },
    });
  } catch (error) {
    console.error("Failed to update editorial:", error);
    return NextResponse.json({ error: "Failed to update editorial" }, { status: 500 });
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

    const updated = await Problem.findOneAndUpdate(
      { slug },
      {
        $set: {
          "editorial.title": "",
          "editorial.content": "",
          "editorial.updatedBy": auth.userId,
          "editorial.updatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Editorial deleted" });
  } catch (error) {
    console.error("Failed to delete editorial:", error);
    return NextResponse.json({ error: "Failed to delete editorial" }, { status: 500 });
  }
}
