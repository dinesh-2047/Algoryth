import { getProblemBySlug } from '../../../../../lib/problems';

export async function GET(request, { params }) {
  const { slug } = params;
  const problem = getProblemBySlug(slug);
  if (!problem || !problem.hints) {
    return Response.json({ error: 'Hints not available' }, { status: 404 });
  }
  // Mock: return all hints, in real app, check attempts
  return Response.json(problem.hints);
}