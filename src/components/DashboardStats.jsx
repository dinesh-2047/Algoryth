'use client';

import React, { useEffect, useRef } from 'react';
import { CheckCircle, Code, Trophy, Award, BarChart3 } from 'lucide-react';

export default function DashboardStats({ submissions = [], stats = null }) {
  // Use provided stats if available, otherwise calculate from submissions
  let displayStats = stats;

  // Compute unique solved problems by ID and their difficulty
  const uniqueSolved = {};
  submissions.forEach((s) => {
    if (s.status === 'Accepted' && s.problemId) {
      uniqueSolved[s.problemId] = s.difficulty || 'Unknown';
    }
  });

  // Animated counter for total
  const totalRef = useRef(null);
  const [displayTotal, setDisplayTotal] = React.useState(0);
  
  // Calculate unique solved problems
  const uniqueSolved = {};
  submissions.forEach(s => {
    if (s.status === 'Accepted') {
      uniqueSolved[s.problemId] = s.difficulty || 'Medium'; // Default to Medium if not provided
    }
  });

  const total = Object.keys(uniqueSolved).length;
  const easy = Object.values(uniqueSolved).filter(d => d === 'Easy').length;
  const medium = Object.values(uniqueSolved).filter(d => d === 'Medium').length;
  const hard = Object.values(uniqueSolved).filter(d => d === 'Hard').length;

  useEffect(() => {
    if (total === 0) {
      return;
    }
    const step = Math.ceil(total / 30) || 1;
    let current = 0;
    const increment = () => {
      current += step;
      if (current >= total) {
        setDisplayTotal(total);
      } else {
        setDisplayTotal(current);
        requestAnimationFrame(increment);
      }
    };
    // Use a timeout to avoid immediate setState in effect
    const timeout = setTimeout(increment, 0);
    return () => clearTimeout(timeout);
  }, [total]);

  // Language frequency
  const languages = {};
  submissions.forEach(s => {
    const lang = s.language || 'unknown';
    languages[lang] = (languages[lang] || 0) + 1;
  });
  
  const sortedLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalPossible = 100; // Placeholder for total problems in system
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Overview Card */}
      <div className="rounded-2xl border border-[#e0d5c2] bg-linear-to-br from-[#fff8ed] to-[#f7e6ff] p-6 dark:border-[#3c3347] dark:bg-linear-to-br dark:from-[#211d27] dark:to-[#2a2137] shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a7a67] dark:text-[#b5a59c] flex items-center gap-2">
            <Award className="h-4 w-4 text-[#d69a44] dark:text-[#f2c66f]" /> Overview
          </h3>
          <Trophy className="h-5 w-5 text-[#d69a44] dark:text-[#f2c66f] animate-bounce" />
        </div>
        <div className="flex items-baseline gap-2">
          <span ref={totalRef} className="text-4xl font-extrabold text-[#2b2116] dark:text-[#f6ede0] drop-shadow-lg">{displayTotal}</span>
          <span className="text-sm text-[#5d5245] dark:text-[#d7ccbe]">problems solved</span>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-2 flex-1 rounded-full bg-[#f2e3cc] dark:bg-[#2d2535] overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-[#d69a44] via-[#f2c66f] to-[#f7e6ff] dark:from-[#f2c66f] dark:to-[#a78bfa] transition-all duration-700"
              style={{ width: `${Math.min(100, (total / totalPossible) * 100)}%` }}
            />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#f2c66f]/20 dark:bg-[#f2c66f]/10 rounded-tl-3xl blur-2xl animate-pulse" />
      </div>

      {/* Difficulty Breakdown */}
      <div className="rounded-2xl border border-[#e0d5c2] bg-linear-to-br from-[#fff8ed] to-[#e6e6ff] p-6 dark:border-[#3c3347] dark:bg-linear-to-br dark:from-[#211d27] dark:to-[#23233a] shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a7a67] dark:text-[#b5a59c] mb-6 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#a78bfa]" /> Difficulty
        </h3>
        <div className="space-y-4">
          <DifficultyRow label="Easy" count={easy} color="text-green-600 dark:text-green-400" />
          <DifficultyRow label="Medium" count={medium} color="text-yellow-600 dark:text-yellow-400" />
          <DifficultyRow label="Hard" count={hard} color="text-red-600 dark:text-red-400" />
        </div>
        <div className="absolute left-0 top-0 w-16 h-16 bg-[#a78bfa]/20 dark:bg-[#a78bfa]/10 rounded-br-3xl blur-2xl animate-pulse" />
      </div>

      {/* Languages */}
      <div className="rounded-2xl border border-[#e0d5c2] bg-linear-to-br from-[#fff8ed] to-[#e6f7ff] p-6 dark:border-[#3c3347] dark:bg-linear-to-br dark:from-[#211d27] dark:to-[#1d2732] shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a7a67] dark:text-[#b5a59c] flex items-center gap-2">
            <Code className="h-4 w-4 text-[#8a7a67] dark:text-[#b5a59c]" /> Languages
          </h3>
        </div>
        {displayStats?.languageUsage && Object.keys(displayStats.languageUsage).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(displayStats.languageUsage).map(([lang, count]) => (
              <div key={lang} className="flex items-center justify-between group">
                <span className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] capitalize">{lang}</span>
                <span className="text-xs font-mono bg-[#f2e3cc] dark:bg-[#2d2535] px-2 py-0.5 rounded text-[#2b2116] dark:text-[#f6ede0]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : sortedLanguages.length > 0 ? (
          <div className="space-y-3">
            {sortedLanguages.map(([lang, count]) => (
              <div key={lang} className="flex items-center justify-between group">
                <span className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] capitalize flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-400 group-hover:scale-125 transition" /> {lang}
                </span>
                <span className="text-xs font-mono bg-[#f2e3cc] dark:bg-[#2d2535] px-2 py-0.5 rounded text-[#2b2116] dark:text-[#f6ede0]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-xs text-[#8a7a67] dark:text-[#b5a59c] opacity-80">
            <Code className="h-8 w-8 mb-2 text-[#b5a59c] opacity-40" />
            No language data yet
          </div>
        )}
        <div className="absolute right-0 top-0 w-16 h-16 bg-[#38bdf8]/10 dark:bg-[#38bdf8]/10 rounded-bl-3xl blur-2xl animate-pulse" />
      </div>
    </div>
  );
}

function DifficultyRow({ label, count, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color.replace('text-', 'bg-')}`} />
        <span className="text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe]">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{count}</span>
    </div>
  );
}
