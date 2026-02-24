'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Target } from 'lucide-react';
import BadgeShowcase from './BadgeShowcase';
import Tabs from './Tabs';

/**
 * BadgePage Component
 * Main page for displaying all badges and achievements
 * Includes multiple tabs for different badge views
 */
export default function BadgePage({ token }) {
  const [activeTab, setActiveTab] = useState('showcase');

  const tabs = [
    { id: 'showcase', label: 'All Badges', icon: Trophy },
    { id: 'progress', label: 'My Progress', icon: Target },
    { id: 'stats', label: 'Statistics', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 text-white pt-12 pb-8"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl"
            >
              🏆
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Achievements</h1>
              <p className="text-blue-100 mt-2">Track your coding milestones and celebrate progress</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center gap-2 px-6 py-3 font-semibold whitespace-nowrap transition-all rounded-t-lg
                    ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon size={20} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'showcase' && (
            <BadgeShowcase token={token} />
          )}

          {activeTab === 'progress' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
                  Your Badge Progress
                </h3>
                <p className="text-blue-800 dark:text-blue-300 mb-4">
                  Check your progress on upcoming badges and see how close you are to unlocking them.
                </p>
                <BadgeShowcase token={token} />
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-4">
                  Badge Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Total Badge Categories
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      9
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Achievement, Difficulty, Streak, Performance, Accuracy, Language, Time, Community, Special
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      MVP Badges Available
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      15
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Currently available badges to earn
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
                    🎯 Pro Tips
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
                    <li>✨ Submit code daily to build your streak!</li>
                    <li>🎲 Try solving problems of all difficulty levels</li>
                    <li>💯 Aim for high acceptance rates on your first attempts</li>
                    <li>🚀 Solve more problems to unlock milestone badges</li>
                    <li>🔥 Practice consistently to reach legendary badges</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
