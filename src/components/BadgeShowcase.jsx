'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BadgeCard from './BadgeCard';
import Spinner from './Spinner';

/**
 * BadgeShowcase Component
 * Displays a grid of all badges with earned/locked states
 * Shows progress towards upcoming badges
 */
export default function BadgeShowcase({ token }) {
  const [allBadges, setAllBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, earned, upcoming

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all available badges
        const badgesRes = await fetch('/api/badges');
        const badgesData = await badgesRes.json();

        if (!badgesRes.ok) {
          throw new Error(badgesData.error || 'Failed to fetch badges');
        }

        // Fetch user's badge progress
        if (token) {
          const progressRes = await fetch('/api/badges/check?progress=true', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const progressData = await progressRes.json();

          if (progressRes.ok) {
            setProgress(progressData);

            // Merge badges with progress data
            const mergedBadges = badgesData.badges.map(badge => {
              const progressInfo = progressData.progress.find(
                p => p.badgeId === badge.badgeId
              );
              return {
                ...badge,
                isEarned: progressInfo?.isEarned || false,
                currentProgress: progressInfo?.currentProgress || 0,
                targetProgress: progressInfo?.targetProgress || 0,
                progressPercentage: progressInfo?.progressPercentage || 0,
              };
            });

            setAllBadges(mergedBadges);
          }
        } else {
          setAllBadges(badgesData.badges);
        }
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [token]);

  const filteredBadges = allBadges.filter(badge => {
    if (filter === 'earned') return badge.isEarned;
    if (filter === 'upcoming') return !badge.isEarned;
    return true;
  });

  const earnedCount = allBadges.filter(b => b.isEarned).length;
  const totalCount = allBadges.length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Badges Earned
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {earnedCount}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Total Badges
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalCount}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Completion
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {completionPercentage}%
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Upcoming
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {totalCount - earnedCount}
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'earned', 'upcoming'].map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`
              px-4 py-2 rounded-full font-semibold text-sm transition-all
              ${
                filter === filterOption
                  ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {filterOption === 'all' && `All Badges (${allBadges.length})`}
            {filterOption === 'earned' && `Earned (${earnedCount})`}
            {filterOption === 'upcoming' && `Upcoming (${totalCount - earnedCount})`}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge, idx) => (
            <motion.div
              key={badge.badgeId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <BadgeCard
                badge={badge}
                isEarned={badge.isEarned}
                progressPercentage={badge.progressPercentage}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            layout
            className="col-span-full text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'earned'
                ? 'No badges earned yet. Keep practicing! 💪'
                : filter === 'upcoming'
                ? 'No upcoming badges available.'
                : 'No badges found.'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Category breakdown */}
      {allBadges.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: 'achievement', emoji: '🏆', title: 'Achievement' },
            { category: 'difficulty', emoji: '👑', title: 'Difficulty' },
            { category: 'streak', emoji: '🔥', title: 'Streak' },
            { category: 'performance', emoji: '⚡', title: 'Performance' },
            { category: 'accuracy', emoji: '🎯', title: 'Accuracy' },
            { category: 'special', emoji: '✨', title: 'Special' },
          ].map(cat => {
            const categoryBadges = allBadges.filter(b => b.category === cat.category);
            const categoryEarned = categoryBadges.filter(b => b.isEarned).length;
            return (
              <div
                key={cat.category}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {cat.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {categoryEarned} of {categoryBadges.length} collected
                </p>
                <div className="mt-2 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-400 to-blue-500 transition-all"
                    style={{
                      width: `${
                        categoryBadges.length > 0
                          ? (categoryEarned / categoryBadges.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
