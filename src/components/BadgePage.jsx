'use client';

import { useState } from 'react';
import { Trophy, Sparkles, Target } from 'lucide-react';
import BadgeShowcase from './BadgeShowcase';
import ActivityHeatmap from './ActivityHeatmap';

export default function BadgePage({ token }) {
  const [activeTab, setActiveTab] = useState('showcase');

  const tabs = [
    { id: 'showcase', label: 'All Badges', icon: Trophy },
    { id: 'progress', label: 'My Progress', icon: Target },
    { id: 'stats', label: 'Statistics', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="absolute -right-10 -top-12 h-36 w-36 rotate-12 border-2 border-black bg-[#ff6b35] dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full border-2 border-black bg-[#44d07d] dark:border-[#8aa0d0] dark:bg-[#1f3a34]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f92ff] px-4 py-1 text-xs font-black uppercase tracking-widest text-black dark:bg-[#fbbf24]">
            <Trophy size={14} />
            Achievements
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff] md:text-4xl">
            Badge Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
            Follow your streak, unlock milestone badges, and track progress across every difficulty level.
          </p>
        </div>
      </header>

      <div className="neo-card p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                  active
                    ? 'bg-[#0f92ff] text-black dark:bg-[#fbbf24]'
                    : 'bg-white text-black hover:bg-[#44d07d] dark:bg-[#151525] dark:text-[#eef3ff] dark:hover:bg-[#253551]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'showcase' && <BadgeShowcase token={token} />}

      {activeTab === 'progress' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="neo-card p-5">
            <h3 className="text-lg font-black uppercase text-black dark:text-[#eef3ff]">
              My Badge Progress
            </h3>
            <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
              Stay focused on your next unlocks and track progress over time.
            </p>
            <div className="mt-4">
              <BadgeShowcase token={token} />
            </div>
          </div>

          <div className="neo-card p-5">
            <h3 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
              Tips To Unlock Faster
            </h3>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-black/80 dark:text-[#d4deff]/85">
              <li>1. Solve at least one problem daily for streak badges.</li>
              <li>2. Mix easy, medium, and hard solves every week.</li>
              <li>3. Re-submit optimized versions to improve performance badges.</li>
              <li>4. Keep acceptance high by testing edge cases locally first.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <ActivityHeatmap token={token} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="neo-card p-5">
              <div className="text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Badge Categories
              </div>
              <div className="mt-2 text-3xl font-black text-black dark:text-[#eef3ff]">9</div>
            </div>

            <div className="neo-card p-5">
              <div className="text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Available MVP Badges
              </div>
              <div className="mt-2 text-3xl font-black text-black dark:text-[#eef3ff]">15</div>
            </div>

            <div className="neo-card p-5">
              <div className="text-xs font-black uppercase tracking-wide text-black/70 dark:text-[#d4deff]/75">
                Focus Metric
              </div>
              <div className="mt-2 text-3xl font-black text-black dark:text-[#eef3ff]">Consistency</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
