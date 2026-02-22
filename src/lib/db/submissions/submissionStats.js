import { connectToDatabase } from '../connect';
import Submission from '../models/Submission';
import User from '../models/User';

/**
 * Check if a submission has the fastest execution time for a problem
 * Used for "Speed Demon" badge
 * @param {string} userId - User ID
 * @param {string} problemSlug - Problem slug
 * @param {number} executionTime - Current submission execution time
 * @returns {Object} - { isFastest: boolean, previousFastest: number }
 */
export async function checkIfFastestSolution(userId, problemSlug, executionTime) {
  try {
    await connectToDatabase();

    // Get the fastest accepted submission for this problem
    const fastestSubmission = await Submission.findOne({
      problemSlug,
      verdict: 'Accepted',
    })
      .sort({ executionTime: 1 })
      .select('executionTime userId');

    if (!fastestSubmission) {
      // First person to solve this problem
      return { isFastest: true, previousFastest: null };
    }

    const isFastest = executionTime < fastestSubmission.executionTime;

    return {
      isFastest,
      previousFastest: fastestSubmission.executionTime,
    };
  } catch (error) {
    console.error('Error checking fastest solution:', error);
    return { isFastest: false, previousFastest: null };
  }
}

/**
 * Check if a submission is memory optimized
 * Used for "Memory Master" and "Rocket Code" badges
 * Estimates memory usage based on code complexity
 * @param {string} code - User's code
 * @returns {number} - Estimated memory usage score (0-100)
 */
export function estimateMemoryUsage(code) {
  // Simple heuristic: count data structure declarations
  let score = 50; // Base score

  // Penalize large data structures
  if (code.includes('[][]') || code.includes('new Array')) score -= 15;
  if (code.includes('while (') && code.includes('// Nested')) score -= 10;
  if (code.includes('Map') || code.includes('Set')) score -= 5;

  // Reward efficient patterns
  if (code.includes('for (let') && !code.includes('nested')) score += 10;
  if (code.includes('const result = ')) score += 5;

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Track submission-level stats for performance badges
 * @param {Object} submission - Submission document
 * @returns {Object} - Performance metrics
 */
export async function trackPerformanceMetrics(submission) {
  try {
    const { userId, problemSlug, verdict, executionTime, code } = submission;

    if (verdict !== 'Accepted') {
      return { fastestSolution: false, memoryOptimized: false };
    }

    const [fastestResult] = await Promise.all([
      checkIfFastestSolution(userId, problemSlug, executionTime),
    ]);

    return {
      fastestSolution: fastestResult.isFastest,
      memoryScore: estimateMemoryUsage(code),
    };
  } catch (error) {
    console.error('Error tracking performance metrics:', error);
    return { fastestSolution: false, memoryOptimized: false };
  }
}

/**
 * Count consecutive accepted submissions
 * Used for "No Errors" badge (20+ consecutive accepted)
 * @param {string} userId - User ID
 * @returns {number} - Consecutive accepted count
 */
export async function getConsecutiveAcceptedCount(userId) {
  try {
    await connectToDatabase();

    const submissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .select('verdict submittedAt')
      .limit(100);

    let consecutiveCount = 0;
    for (const submission of submissions) {
      if (submission.verdict === 'Accepted') {
        consecutiveCount++;
      } else {
        break; // Stop at first non-accepted
      }
    }

    return consecutiveCount;
  } catch (error) {
    console.error('Error getting consecutive accepted count:', error);
    return 0;
  }
}

/**
 * Track failures before success (wrong answers that eventually get accepted)
 * Used for "Debug Master" badge (50+ wrong answers then accepted)
 * @param {string} userId - User ID
 * @param {string} problemSlug - Problem slug
 * @returns {number} - Number of failed attempts before first acceptance
 */
export async function getFailureCountBeforeSuccess(userId, problemSlug) {
  try {
    await connectToDatabase();

    const submissions = await Submission.find({
      userId,
      problemSlug,
    })
      .sort({ submittedAt: 1 })
      .select('verdict');

    let failureCount = 0;
    for (const submission of submissions) {
      if (submission.verdict === 'Accepted') {
        return failureCount; // Return count when first accepted
      }
      failureCount++;
    }

    return 0; // No acceptance yet
  } catch (error) {
    console.error('Error getting failure count:', error);
    return 0;
  }
}

/**
 * Count solved problems by difficulty level
 * Used for difficulty-based badges
 * @param {string} userId - User ID
 * @returns {Object} - { easy: number, medium: number, hard: number }
 */
export async function getProblemsCountByDifficulty(userId) {
  try {
    await connectToDatabase();

    const result = await Submission.aggregate([
      {
        $match: {
          userId: userId.toString ? userId : new require('mongoose').Types.ObjectId(userId),
          verdict: 'Accepted',
        },
      },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    result.forEach(r => {
      const diff = r._id?.toLowerCase();
      if (diff === 'easy') counts.easy = r.count;
      if (diff === 'medium') counts.medium = r.count;
      if (diff === 'hard') counts.hard = r.count;
    });

    return counts;
  } catch (error) {
    console.error('Error getting difficulty counts:', error);
    return { easy: 0, medium: 0, hard: 0 };
  }
}

/**
 * Get unique languages used by user
 * Used for language-based badges (future Phase)
 * @param {string} userId - User ID
 * @returns {Array} - Array of languages used
 */
export async function getLanguagesUsed(userId) {
  try {
    await connectToDatabase();

    const languages = await Submission.distinct('language', {
      userId,
      verdict: 'Accepted',
    });

    return languages;
  } catch (error) {
    console.error('Error getting languages used:', error);
    return [];
  }
}
