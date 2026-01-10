import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req,
  { params }
) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug: params.slug },
    });

    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      statement: problem.statement,
      constraints: problem.constraints,
      examples: problem.examples,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
