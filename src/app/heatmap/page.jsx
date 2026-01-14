import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const HeatmapPage = () => {
  const today = new Date();

  // Example data for user streaks
  const userStreakData = [
    { date: '2026-01-01', count: 1 },
    { date: '2026-01-02', count: 2 },
    { date: '2026-01-03', count: 3 },
    { date: '2026-01-05', count: 1 },
    { date: '2026-01-07', count: 4 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Daily Streak Heatmap</h1>
      <CalendarHeatmap
        startDate={new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())}
        endDate={today}
        values={userStreakData}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-scale-${value.count}`;
        }}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) {
            return { 'data-tip': 'No data' };
          }
          return { 'data-tip': `${value.date}: ${value.count} streak(s)` };
        }}
        showWeekdayLabels
      />
    </div>
  );
};

export default HeatmapPage;