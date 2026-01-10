import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
      },
    });

    return NextResponse.json({ items: problems });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
