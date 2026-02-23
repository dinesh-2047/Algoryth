'use client';

import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

/**
 * BadgeCard Component
 * Displays a single badge card with earned/locked state
 * Shows badge details on hover
 */
export default function BadgeCard({ badge, isEarned = false, progressPercentage = 0 }) {
  if (!badge) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700',
    uncommon: 'from-green-400 to-green-500 dark:from-green-600 dark:to-green-700',
    rare: 'from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700',
    legendary: 'from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700',
  };

  const rarityBorder = {
    common: 'border-gray-300 dark:border-gray-600',
    uncommon: 'border-green-300 dark:border-green-600',
    rare: 'border-blue-300 dark:border-blue-600',
    legendary: 'border-yellow-300 dark:border-yellow-600',
  };

  const rarityBg = {
    common: 'bg-gray-50 dark:bg-gray-800',
    uncommon: 'bg-green-50 dark:bg-green-900',
    rare: 'bg-blue-50 dark:bg-blue-900',
    legendary: 'bg-yellow-50 dark:bg-yellow-900',
  };

  return (
    <motion.div
      whileHover={{ scale: isEarned ? 1.05 : 1, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      className="relative"
    >
      <div
        className={`
          relative w-32 h-40 rounded-2xl border-2 p-4 flex flex-col items-center justify-center
          ${rarityBg[badge.rarity] || rarityBg.common}
          ${rarityBorder[badge.rarity] || rarityBorder.common}
          ${isEarned ? 'shadow-lg' : 'opacity-60 grayscale'}
          transition-all duration-300 cursor-pointer
          hover:shadow-2xl
        `}
      >
        {/* Rarity gradient background */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-10
            bg-linear-to-br ${rarityColors[badge.rarity] || rarityColors.common}
            pointer-events-none
          `}
        ></div>

        {/* Badge emoji/icon */}
        <div className="text-5xl mb-2 z-10 drop-shadow-lg">
          {badge.emoji || '🏆'}
        </div>

        {/* Badge name */}
        <h3 className="text-xs font-bold text-center text-gray-900 dark:text-white z-10 leading-tight line-clamp-2">
          {badge.name}
        </h3>

        {/* Rarity label */}
        <div className="text-xs mt-2 px-2 py-1 rounded-full bg-white/50 dark:bg-black/30 z-10 capitalize font-semibold">
          {badge.rarity}
        </div>

        {/* Earned checkmark or locked icon */}
        <div className="absolute -top-3 -right-3 z-20">
          {isEarned ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="bg-green-500 dark:bg-green-600 text-white rounded-full p-2 shadow-lg"
            >
              <Check size={16} strokeWidth={3} />
            </motion.div>
          ) : (
            <div className="bg-gray-400 dark:bg-gray-600 text-white rounded-full p-2 shadow-lg">
              <Lock size={16} />
            </div>
          )}
        </div>

        {/* Progress bar for locked badges */}
        {!isEarned && progressPercentage > 0 && (
          <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-linear-to-r from-blue-400 to-blue-500"
            ></motion.div>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 dark:bg-black text-white text-xs rounded-lg p-2 w-48 z-50 pointer-events-none hidden hover:block"
      >
        <p className="font-bold mb-1">{badge.description}</p>
        {!isEarned && (
          <p className="text-gray-300">
            Progress: {progressPercentage}% towards unlock
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
