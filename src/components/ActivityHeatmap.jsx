'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColorClass(count) {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (count === 1) return 'bg-green-200 dark:bg-green-900';
  if (count <= 3) return 'bg-green-300 dark:bg-green-700';
  if (count <= 6) return 'bg-green-500 dark:bg-green-500';
  return 'bg-green-700 dark:bg-green-300';
}

function buildGrid() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 51 * 7);

  const weeks = [];
  const monthLabels = [];
  let lastMonth = -1;

  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      const dateStr = cell.toISOString().split('T')[0];
      const isFuture = dateStr > todayStr;
      week.push({ dateStr, isFuture });

      if (d === 0) {
        const m = cell.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTH_NAMES[m], weekIndex: w });
          lastMonth = m;
        }
      }
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

/**
 * ActivityHeatmap
 *
 * Displays a GitHub / LeetCode-style submission calendar showing
 * how many submissions the user made each day over the past 52 weeks.
 *
 * Props:
 *   token {string} – JWT auth token from AuthContext
 */
export default function ActivityHeatmap({ token }) {
  const [activityMap, setActivityMap]           = useState({});
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [tooltip, setTooltip]                   = useState(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [activeDays, setActiveDays]             = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchActivity();
  }, [token]);

  async function fetchActivity() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/activity', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      const map  = {};
      let total  = 0;
      let active = 0;

      (data.activity || []).forEach(({ date, count }) => {
        map[date] = count;
        total    += count;
        if (count > 0) active++;
      });

      setActivityMap(map);
      setTotalSubmissions(total);
      setActiveDays(active);
    } catch (err) {
      console.error('ActivityHeatmap fetch error:', err);
      setError('Failed to load activity data.');
    } finally {
      setLoading(false);
    }
  }

  // ── Early-exit render states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm
                      text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20
                      dark:text-yellow-300">
        Please sign in to view your activity heatmap.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm
                      text-red-800 dark:border-red-800 dark:bg-red-900/20
                      dark:text-red-300">
        {error}
      </div>
    );
  }

  // ── Grid + tooltip ─────────────────────────────────────────────────────────

  const { weeks, monthLabels } = buildGrid();

  const CELL = 13;
  const GAP  = 2;
  const STEP = CELL + GAP;

  function handleMouseEnter(e, dateStr, count) {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const cellRect      = e.currentTarget.getBoundingClientRect();
    setTooltip({
      dateStr,
      count,
      x: cellRect.left - containerRect.left + CELL / 2,
      y: cellRect.top  - containerRect.top,
    });
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white p-6
                 dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Submission Activity
        </h3>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalSubmissions}
            </span>{' '}submissions
          </span>
          <span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {activeDays}
            </span>{' '}active days
          </span>
        </div>
      </div>

      {/* Scrollable heatmap */}
      <div className="overflow-x-auto pb-1">
        <div ref={containerRef} className="relative inline-block select-none">

          {/* Month labels */}
          <div className="mb-1 flex" style={{ paddingLeft: 32 }}>
            {weeks.map((_, wi) => {
              const entry = monthLabels.find(m => m.weekIndex === wi);
              return (
                <div
                  key={wi}
                  className="text-center text-xs text-gray-400 dark:text-gray-500"
                  style={{ width: STEP, minWidth: STEP }}
                >
                  {entry ? entry.label : ''}
                </div>
              );
            })}
          </div>

          {/* Day labels + grid */}
          <div className="flex">
            {/* Mon / Wed / Fri labels only */}
            <div className="mr-1 flex flex-col" style={{ width: 28 }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="text-right text-xs leading-none text-gray-400 dark:text-gray-500"
                  style={{ height: STEP, paddingTop: (STEP - 12) / 2 }}
                >
                  {i === 1 || i === 3 || i === 5 ? label : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map(({ dateStr, isFuture }) => {
                    const count = activityMap[dateStr] || 0;
                    return (
                      <div
                        key={dateStr}
                        className={`rounded-sm transition-transform duration-100
                          ${isFuture
                            ? 'cursor-default opacity-20 bg-gray-100 dark:bg-gray-700'
                            : `cursor-pointer hover:scale-125 hover:ring-1
                               hover:ring-gray-400 dark:hover:ring-gray-400
                               ${getColorClass(count)}`
                          }`}
                        style={{ width: CELL, height: CELL }}
                        onMouseEnter={isFuture ? undefined : (e) => handleMouseEnter(e, dateStr, count)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full
                         rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-xl
                         dark:bg-black"
              style={{ left: tooltip.x, top: tooltip.y - 8 }}
            >
              <div className="font-semibold">{tooltip.dateStr}</div>
              <div className="text-gray-300">
                {tooltip.count === 0
                  ? 'No submissions'
                  : `${tooltip.count} submission${tooltip.count !== 1 ? 's' : ''}`}
              </div>
              <div className="absolute left-1/2 top-full -translate-x-1/2
                             border-4 border-transparent border-t-gray-900
                             dark:border-t-black" />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
        {[0, 1, 2, 4, 7].map((n) => (
          <div
            key={n}
            className={`rounded-sm ${getColorClass(n)}`}
            style={{ width: CELL, height: CELL }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
      </div>
    </motion.div>
  );
}