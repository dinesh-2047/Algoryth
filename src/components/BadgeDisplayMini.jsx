'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BadgeCard from './BadgeCard';
import Spinner from './Spinner';

/**
 * BadgeDisplayMini Component
 * Compact badge display for dashboard and other pages
 * Shows user's recent earned badges or featured badges
 */
export default function BadgeDisplayMini({ token, maxBadges = 6, showViewAll = true }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/badges/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch badges');
        }

        // Get the most recent badges
        const recentBadges = data.badges
          .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
          .slice(0, maxBadges);

        setBadges(recentBadges);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [token, maxBadges]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 text-center">
        <p className="text-sm text-red-700 dark:text-red-300">
          Failed to load badges. Please try again later.
        </p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Badges Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Start solving problems to earn your first badge!
        </p>
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm"
        >
          Start Coding <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Recent Badges
        </h3>
        {showViewAll && badges.length > 0 && (
          <Link
            href="/badges"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Badge Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {badges.map((badge, idx) => (
          <motion.div
            key={badge._id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            layout
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              title={badge.badgeDetails?.description}
            >
              <BadgeCard
                badge={badge.badgeDetails}
                isEarned={true}
                progressPercentage={100}
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {badges.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {badges.length > 0 ? badges[0].badgeDetails?.rarity === 'legendary' ? '✓' : badges[0].badgeDetails?.rarity === 'rare' ? '◆' : '▪' : '—'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Best</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            🔥
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
        </div>
      </div>

      {/* Encouragement */}
      {badges.length < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center"
        >
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            ✨ Keep solving! You&apos;re {5 - badges.length} badges away from a great collection!
          </p>
        </motion.div>
      )}
    </div>
  );
}
