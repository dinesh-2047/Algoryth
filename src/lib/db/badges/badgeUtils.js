import { connectToDatabase } from '../connect';
import Badge from '../models/Badge';
import UserBadge from '../models/UserBadge';
import User from '../models/User';
import {
  getConsecutiveAcceptedCount,
  getFailureCountBeforeSuccess,
  getProblemsCountByDifficulty,
  getLanguagesUsed,
} from '../submissions/submissionStats';

/**
 * Check and award badges to a user based on their current stats
 * This function is called after a submission or at scheduled intervals
 * @param {string} userId - MongoDB user ID
 * @returns {Object} - { newBadges: [], totalBadges: number }
 */
export async function checkAndAwardBadges(userId) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return { newBadges: [], error: 'User not found' };
    }

    const newBadges = [];

    // Get all active badges
    const allBadges = await Badge.find({ isActive: true });

    // Get user's already earned badges
    const earnedBadges = await UserBadge.find({ userId }).select('badgeId');
    const earnedBadgeIds = earnedBadges.map(ub => ub.badgeId);

    // Check each badge to see if user qualifies
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.badgeId)) {
        continue;
      }

      const isEarned = await evaluateBadgeCriteriaAsync(badge, user);

      if (isEarned) {
        try {
          const userBadge = new UserBadge({
            userId,
            badgeId: badge.badgeId,
            awardedAt: new Date(),
            progressValue: await evaluateProgressValueAsync(badge, user),
            isNotified: false,
          });

          await userBadge.save();

          // Increment badge award count
          await Badge.findByIdAndUpdate(badge._id, {
            $inc: { awardedCount: 1 },
          });

          newBadges.push({
            badgeId: badge.badgeId,
            name: badge.name,
            emoji: badge.emoji,
            rarity: badge.rarity,
          });
        } catch (saveError) {
          console.error(`Error saving badge ${badge.badgeId}:`, saveError);
        }
      }
    }

    // Update user's total badge count
    const totalBadgesEarned = earnedBadges.length + newBadges.length;
    await User.findByIdAndUpdate(userId, { totalBadges: totalBadgesEarned });

    return {
      newBadges,
      totalBadges: totalBadgesEarned,
    };
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return { newBadges: [], error: error.message };
  }
}

/**
 * Evaluate if a user meets the criteria for a specific badge (async version)
 * @param {Object} badge - Badge document from DB
 * @param {Object} user - User document from DB with stats
 * @returns {boolean} - Whether user qualifies for the badge
 */
async function evaluateBadgeCriteriaAsync(badge, user) {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'milestone':
      return evaluateMilestoneCriteria(criteria, user);

    case 'streak':
      return evaluateStreakCriteria(criteria, user);

    case 'performance':
      return evaluatePerformanceCriteria(criteria, user);

    case 'accuracy':
      return await evaluateAccuracyCriteriaAsync(criteria, user);

    case 'first-try':
      return evaluateFirstTryCriteria(criteria, user);

    case 'hidden':
      return await evaluateHiddenCriteria(criteria, user);

    default:
      return false;
  }
}

/**
 * Evaluate if a user meets the criteria for a specific badge (sync version)
 * @param {Object} badge - Badge document from DB
 * @param {Object} user - User document from DB with stats
 * @returns {boolean} - Whether user qualifies for the badge
 */
function evaluateBadgeCriteria(badge, user) {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'milestone':
      return evaluateMilestoneCriteria(criteria, user);

    case 'streak':
      return evaluateStreakCriteria(criteria, user);

    case 'performance':
      return evaluatePerformanceCriteria(criteria, user);

    case 'accuracy':
      return evaluateAccuracyCriteria(criteria, user);

    case 'first-try':
      return evaluateFirstTryCriteria(criteria, user);

    case 'hidden':
      return evaluateHiddenCriteria(criteria, user);

    default:
      return false;
  }
}

/**
 * Evaluate milestone badges (problem count based)
 */
function evaluateMilestoneCriteria(criteria, user) {
  // first-solve badge
  if (criteria.condition.includes('totalAcceptedCount >= 1')) {
    return user.totalAcceptedCount >= 1;
  }

  // Problem Solver badges (10, 25, 50, 100)
  if (criteria.condition.includes('totalAcceptedCount >=')) {
    const match = criteria.condition.match(/totalAcceptedCount >= (\d+)/);
    if (match) {
      const required = parseInt(match[1]);
      return user.totalAcceptedCount >= required;
    }
  }

  return false;
}

/**
 * Evaluate difficulty-based badges (needs async evaluation)
 */
async function evaluateDifficultyCriteria(criteria, user) {
  if (criteria.condition.includes('solvedAllDifficulties === true')) {
    return false; // Will be enhanced in async evaluator
  }

  return false;
}

/**
 * Evaluate streak badges
 */
function evaluateStreakCriteria(criteria, user) {
  if (criteria.condition.includes('streakCount >=')) {
    const match = criteria.condition.match(/streakCount >= (\d+)/);
    if (match) {
      const required = parseInt(match[1]);
      return user.streakCount >= required;
    }
  }

  return false;
}

/**
 * Evaluate performance badges (speed, optimization)
 */
function evaluatePerformanceCriteria(criteria, user) {
  // Speed Demon and Rocket Code are tracked per submission
  // This will be enhanced in Phase 3 with submission-level tracking
  return false; // Placeholder
}

/**
 * Evaluate accuracy badges
 */
function evaluateAccuracyCriteria(criteria, user) {
  if (criteria.condition.includes('acceptanceRate >= 80 AND totalSubmissions >= 10')) {
    return user.acceptanceRate >= 80 && user.totalSubmissions >= 10;
  }

  if (criteria.condition.includes('acceptanceRate >= 95 AND totalSubmissions >= 20')) {
    return user.acceptanceRate >= 95 && user.totalSubmissions >= 20;
  }

  // For async criteria, return false here
  if (criteria.condition.includes('consecutiveAcceptedCount >= 20')) {
    return false;
  }

  return false;
}

/**
 * Evaluate accuracy badges (async version for consecutive accepted)
 */
async function evaluateAccuracyCriteriaAsync(criteria, user) {
  if (criteria.condition.includes('acceptanceRate >= 80 AND totalSubmissions >= 10')) {
    return user.acceptanceRate >= 80 && user.totalSubmissions >= 10;
  }

  if (criteria.condition.includes('acceptanceRate >= 95 AND totalSubmissions >= 20')) {
    return user.acceptanceRate >= 95 && user.totalSubmissions >= 20;
  }

  if (criteria.condition.includes('consecutiveAcceptedCount >= 20')) {
    const consecutiveCount = await getConsecutiveAcceptedCount(user._id);
    return consecutiveCount >= 20;
  }

  return false;
}

/**
 * Evaluate first-try badges
 */
function evaluateFirstTryCriteria(criteria, user) {
  if (criteria.condition.includes('perfectAcceptanceCount >= 10')) {
    return user.perfectAcceptanceCount >= 10;
  }

  return false;
}

/**
 * Evaluate hidden/special badges
 */
async function evaluateHiddenCriteria(criteria, user) {
  if (criteria.condition.includes('totalFailuresBeforeSuccess >= 50')) {
    // This would require tracking total across all problems
    // For now, it's a placeholder that can be enhanced
    return false; // Placeholder - requires enhanced implementation
  }

  return false;
}

/**
 * Get the current progress value for a badge (async version for complex badges)
 * Used to display progress towards earning badges
 * @param {Object} badge - Badge document
 * @param {Object} user - User document
 * @returns {number} - Current progress value
 */
async function evaluateProgressValueAsync(badge, user) {
  const { criteria } = badge;

  if (criteria.type === 'milestone') {
    if (criteria.condition.includes('totalAcceptedCount')) {
      return user.totalAcceptedCount;
    }
  }

  if (criteria.type === 'streak') {
    if (criteria.condition.includes('streakCount')) {
      return user.streakCount;
    }
  }

  if (criteria.type === 'accuracy') {
    if (criteria.condition.includes('consecutiveAcceptedCount')) {
      return await getConsecutiveAcceptedCount(user._id);
    }
    if (criteria.condition.includes('acceptanceRate')) {
      return user.acceptanceRate;
    }
  }

  if (criteria.type === 'first-try') {
    if (criteria.condition.includes('perfectAcceptanceCount')) {
      return user.perfectAcceptanceCount;
    }
  }

  return 0;
}

/**
 * Get the current progress value for a badge (sync version)
 * Used to display progress towards earning badges
 * @param {Object} badge - Badge document
 * @param {Object} user - User document
 * @returns {number} - Current progress value
 */
function evaluateProgressValue(badge, user) {
  const { criteria } = badge;

  if (criteria.type === 'milestone') {
    if (criteria.condition.includes('totalAcceptedCount')) {
      return user.totalAcceptedCount;
    }
  }

  if (criteria.type === 'streak') {
    if (criteria.condition.includes('streakCount')) {
      return user.streakCount;
    }
  }

  if (criteria.type === 'accuracy') {
    if (criteria.condition.includes('acceptanceRate')) {
      return user.acceptanceRate;
    }
  }

  if (criteria.type === 'first-try') {
    if (criteria.condition.includes('perfectAcceptanceCount')) {
      return user.perfectAcceptanceCount;
    }
  }

  return 0;
}

/**
 * Get user's badge progress (how close they are to earning each badge)
 * @param {string} userId - MongoDB user ID
 * @returns {Object} - Badge progress data
 */
export async function getBadgeProgress(userId) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    const earnedBadges = await UserBadge.find({ userId }).select('badgeId');
    const earnedBadgeIds = earnedBadges.map(ub => ub.badgeId);

    const allBadges = await Badge.find({ isActive: true });

    const progress = allBadges.map(badge => {
      const isEarned = earnedBadgeIds.includes(badge.badgeId);
      const currentProgress = evaluateProgressValue(badge, user);
      const targetProgress = badge.criteria.value;

      return {
        badgeId: badge.badgeId,
        name: badge.name,
        emoji: badge.emoji,
        isEarned,
        currentProgress,
        targetProgress,
        progressPercentage: Math.min(
          ((currentProgress / targetProgress) * 100).toFixed(2),
          100
        ),
      };
    });

    return {
      earnedCount: earnedBadges.length,
      totalBadges: allBadges.length,
      progress,
    };
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return { error: error.message };
  }
}
