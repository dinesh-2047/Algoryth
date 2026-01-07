import { promises as fs } from 'fs';
import path from 'path';

const submissionsFile = path.join(process.cwd(), 'submissions.json');

export async function GET() {
  try {
    const data = await fs.readFile(submissionsFile, 'utf8');
    const submissions = JSON.parse(data);
    return Response.json(submissions);
  } catch (error) {
    return Response.json({ error: 'Failed to read submissions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { problemId, code, status } = await request.json();
    const data = await fs.readFile(submissionsFile, 'utf8');
    const submissions = JSON.parse(data);
    const newSubmission = {
      id: Date.now().toString(),
      problemId,
      code,
      status,
      timestamp: new Date().toISOString(),
      userId: 'default'
    };
    submissions.push(newSubmission);
    await fs.writeFile(submissionsFile, JSON.stringify(submissions, null, 2));
    return Response.json(newSubmission, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}