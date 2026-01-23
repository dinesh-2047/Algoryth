import { NextResponse } from "next/server";
import { problems } from "../../../lib/problems";
import { createErrorResponse, createSuccessResponse, logApiRequest, logApiError } from "../../../lib/api-utils";

export function GET(request) {
  try {
    logApiRequest('GET', '/api/problems');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',') || [];
    const sort = searchParams.get('sort') || 'title';

    // Validate difficulty parameter
    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return createErrorResponse('Invalid difficulty parameter', 400, 'INVALID_DIFFICULTY');
    }

    // Validate sort parameter
    if (sort && !['title', 'difficulty', 'acceptance'].includes(sort)) {
      return createErrorResponse('Invalid sort parameter', 400, 'INVALID_SORT');
    }

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
      if (sort === 'acceptance') {
        // Sort by acceptance rate (assuming higher is better)
        return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
      }
      // Default to title
      return a.title.localeCompare(b.title);
    });

    return createSuccessResponse({ items: filtered });
  } catch (error) {
    logApiError('GET', '/api/problems', error);
    return createErrorResponse('Failed to fetch problems', 500, 'FETCH_PROBLEMS_ERROR');
  }
}
