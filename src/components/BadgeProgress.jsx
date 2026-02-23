'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * BadgeProgress Component
 * Shows detailed progress towards earning badges
 * Displays current progress, target, and percentage
 */
export default function BadgeProgress({ badge, isEarned = false, currentProgress = 0, targetProgress = 100, progressPercentage = 0 }) {
  if (!badge) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-500',
    rare: 'from-blue-400 to-blue-500',
    legendary: 'from-yellow-400 to-yellow-500',
  };

  const displayPercentage = Math.min(Math.round(parseFloat(progressPercentage)), 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
    >
      {/* Badge header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{badge.emoji}</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white">
              {badge.name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {badge.description}
            </p>
          </div>
        </div>
        {isEarned && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full"
          >
            ✓ Earned
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {currentProgress} / {targetProgress}
          </span>
        </div>

        {/* Animated progress bar */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${displayPercentage}%` }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className={`h-full rounded-full bg-linear-to-r ${rarityColors[badge.rarity] || rarityColors.common} shadow-lg`}
          ></motion.div

>
          {/* Animated dots overlay */}
          {displayPercentage < 100 && (
            <motion.div
              animate={{ x: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-50"
              style={{ left: `${displayPercentage}%` }}
            ></motion.div>
          )}
        </div>

        <div className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
          {displayPercentage}%
        </div>
      </div>

      {/* Badge info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Category</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {badge.category}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rarity</div>
          <div className={`text-sm font-semibold capitalize ${
            badge.rarity === 'legendary' ? 'text-yellow-600 dark:text-yellow-400' :
            badge.rarity === 'rare' ? 'text-blue-600 dark:text-blue-400' :
            badge.rarity === 'uncommon' ? 'text-green-600 dark:text-green-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {badge.rarity}
          </div>
        </div>
      </div>

      {/* Requirement details */}
      {badge.requirements && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
            Requirements
          </h5>
          <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-300">
            {badge.requirements.minProblems > 0 && (
              <li className="flex items-center gap-2">
                <ChevronRight size={14} />
                Min {badge.requirements.minProblems} problems
              </li>
            )}
            {badge.requirements.minAcceptanceRate > 0 && (
              <li className="flex items-center gap-2">
                <ChevronRight size={14} />
                {badge.requirements.minAcceptanceRate}% acceptance rate
              </li>
            )}
            {badge.requirements.minDifficulty && (
              <li className="flex items-center gap-2">
                <ChevronRight size={14} />
                Difficulty: {badge.requirements.minDifficulty}+
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Earned status */}
      {isEarned && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center"
        >
          <p className="text-sm font-bold text-green-700 dark:text-green-400">
            🎉 You've earned this badge!
          </p>
        </motion.div>
      )}

      {/* Progress message */}
      {!isEarned && displayPercentage > 0 && displayPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center"
        >
          ✨ Keep going! {targetProgress - currentProgress} more to unlock this badge
        </motion.div>
      )}

      {!isEarned && displayPercentage === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center"
        >
          🎯 Complete {targetProgress} to unlock this badge
        </motion.div>
      )}
    </motion.div>
  );
}
