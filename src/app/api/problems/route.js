import { NextResponse } from "next/server";
import { problems } from "../../../lib/problems";

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
    rating: p.rating,
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

  // Filter by difficulty (backward compatibility with rating ranges)
  if (difficulty) {
    filtered = filtered.filter(p => {
      if (difficulty === 'Easy') {
        return p.rating < 1300;
      } else if (difficulty === 'Medium') {
        return p.rating >= 1300 && p.rating < 1900;
      } else if (difficulty === 'Hard') {
        return p.rating >= 1900;
      }
      return true;
    });
  }

  // Filter by tags
  if (tags.length > 0) {
    filtered = filtered.filter(p => tags.some(tag => p.tags.includes(tag)));
  }

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'difficulty' || sort === 'rating') {
      return a.rating - b.rating;
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default to title
    return a.title.localeCompare(b.title);
  });

  return NextResponse.json({ items: filtered });
}
