import { NextResponse } from "next/server";
import { problems } from "../../../lib/problems";
import { withErrorHandler, createSuccessResponse, APIError } from "../../../lib/api-utils";

export const GET = withErrorHandler(async (req) => {
  try {
    // Validate that problems data exists
    if (!problems || !Array.isArray(problems)) {
      throw new APIError("Problems data is unavailable", 503, "SERVICE_UNAVAILABLE");
    }

    const list = problems.map((p) => {
      // Validate required fields
      if (!p.id || !p.slug || !p.title) {
        console.warn(`Problem ${p.id || 'unknown'} is missing required fields`);
        return null;
      }

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty || "Unknown",
        tags: Array.isArray(p.tags) ? p.tags : [],
      };
    }).filter(Boolean); // Remove null entries

    const meta = {
      total: list.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(createSuccessResponse(list, { meta }));
  } catch (error) {
    // Re-throw to be handled by withErrorHandler
    throw error;
  }
});
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty');
  const tags = searchParams.get('tags')?.split(',') || [];
  const sort = searchParams.get('sort') || 'title';

  let filtered = problems.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
  }));

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => {
      const problem = problems.find(prob => prob.id === p.id);
      return (
        p.title.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        problem.statement.toLowerCase().includes(searchLower)
      );
    });
  }

  // Filter by difficulty
  if (difficulty) {
    filtered = filtered.filter(p => p.difficulty === difficulty);
  }

  // Filter by tags
  if (tags.length > 0) {
    filtered = filtered.filter(p => tags.some(tag => p.tags.includes(tag)));
  }

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'difficulty') {
      const order = { Easy: 1, Medium: 2, Hard: 3 };
      return order[a.difficulty] - order[b.difficulty];
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default to title
    return a.title.localeCompare(b.title);
  });

  return NextResponse.json({ items: filtered });
}

