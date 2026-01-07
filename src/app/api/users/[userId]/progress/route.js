import { promises as fs } from 'fs';
import path from 'path';
import { problems } from '../../../../../lib/problems';

const submissionsFile = path.join(process.cwd(), 'submissions.json');

export async function GET(request, { params }) {
  const { userId } = params;
  try {
    const data = await fs.readFile(submissionsFile, 'utf8');
    const submissions = JSON.parse(data);
    const userSubmissions = submissions.filter(s => s.userId === userId);

    const problemStatuses = {};
    problems.forEach(p => {
      const subs = userSubmissions.filter(s => s.problemId === p.id);
      if (subs.some(s => s.status === 'Accepted')) {
        problemStatuses[p.id] = 'Solved';
      } else if (subs.length > 0) {
        problemStatuses[p.id] = 'Attempted';
      } else {
        problemStatuses[p.id] = 'Not Started';
      }
    });

    const solved = Object.values(problemStatuses).filter(s => s === 'Solved').length;
    const total = problems.length;
    const completionPercentage = Math.round((solved / total) * 100);

    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach(p => {
      if (problemStatuses[p.id] === 'Solved') {
        difficultyBreakdown[p.difficulty]++;
      }
    });

    // Simple streak: consecutive days with submissions
    const dates = [...new Set(userSubmissions.map(s => s.timestamp.split('T')[0]))].sort();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dates[i] === today || new Date(dates[i]) >= new Date(Date.now() - streak * 24 * 60 * 60 * 1000)) {
        streak++;
      } else {
        break;
      }
    }

    return Response.json({
      completionPercentage,
      streak,
      difficultyBreakdown,
      problemStatuses
    });
  } catch (error) {
    return Response.json({ error: 'Failed to calculate progress' }, { status: 500 });
  }
}