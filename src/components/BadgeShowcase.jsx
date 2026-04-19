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
          className="neo-card p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Badges Earned
              </div>
              <div className="text-3xl font-black text-black dark:text-[#eef3ff]">
                {earnedCount}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Total Badges
              </div>
              <div className="text-3xl font-black text-black dark:text-[#eef3ff]">
                {totalCount}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Completion
              </div>
              <div className="text-3xl font-black text-black dark:text-[#eef3ff]">
                {completionPercentage}%
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Upcoming
              </div>
              <div className="text-3xl font-black text-black dark:text-[#eef3ff]">
                {totalCount - earnedCount}
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-black/70 dark:text-[#d4deff]/75">Overall Progress</span>
              <span className="font-black text-black dark:text-[#eef3ff]">{completionPercentage}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-black bg-white dark:border-[#8aa0d0] dark:bg-[#151525]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-linear-to-r from-[#44d07d] via-[#0f92ff] to-[#ff6b35]"
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
              rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition-all
              ${
                filter === filterOption
                  ? 'bg-[#0f92ff] text-black dark:bg-[#fbbf24]'
                  : 'bg-white text-black hover:bg-[#44d07d] dark:bg-[#151525] dark:text-[#eef3ff] dark:hover:bg-[#253551]'
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
            <p className="text-black/70 dark:text-[#d4deff]/75">
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
                className="neo-card rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h4 className="text-sm font-black uppercase text-black dark:text-[#eef3ff]">
                    {cat.title}
                  </h4>
                </div>
                <p className="text-xs font-semibold text-black/70 dark:text-[#d4deff]/75">
                  {categoryEarned} of {categoryBadges.length} collected
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-black bg-white dark:border-[#8aa0d0] dark:bg-[#151525]">
                  <div
                    className="h-full bg-linear-to-r from-[#44d07d] to-[#0f92ff] transition-all"
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
