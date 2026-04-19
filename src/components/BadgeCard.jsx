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
      className="group relative"
    >
      <div
        className={`
          relative h-40 w-32 rounded-2xl border p-4 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#8aa0d0] flex flex-col items-center justify-center
          ${rarityBg[badge.rarity] || rarityBg.common}
          ${rarityBorder[badge.rarity] || rarityBorder.common}
          ${isEarned ? 'opacity-100' : 'opacity-80'}
          transition-all duration-300 cursor-pointer
          hover:-translate-y-0.5
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
        <div className="mt-2 rounded-full bg-white/80 px-2 py-1 text-xs font-black uppercase text-black dark:bg-[#1f2b45] dark:text-[#d8e7ff] z-10">
          {badge.rarity}
        </div>

        {/* Earned checkmark or locked icon */}
        <div className="absolute -top-3 -right-3 z-20">
          {isEarned ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="rounded-full bg-green-500 p-2 text-white shadow-lg dark:bg-green-600"
            >
              <Check size={16} strokeWidth={3} />
            </motion.div>
          ) : (
            <div className="rounded-full bg-gray-500 p-2 text-white shadow-lg dark:bg-gray-600">
              <Lock size={16} />
            </div>
          )}
        </div>

        {/* Progress bar for locked badges */}
        {!isEarned && progressPercentage > 0 && (
          <div className="absolute bottom-2 left-2 right-2 h-1.5 overflow-hidden rounded-full border border-black/20 bg-white/70 dark:border-[#8aa0d0]/35 dark:bg-[#151525] z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-linear-to-r from-[#44d07d] to-[#0f92ff]"
            ></motion.div>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        className="pointer-events-none absolute left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg bg-[#0b1220] p-2 text-xs text-white opacity-0 transition group-hover:opacity-100 dark:bg-[#020409]"
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
