export const START_DAY  = 5;
export const END_DAY    = 23;
export const START_HOUR = 8;
export const END_HOUR   = 21; // last slot: 21:30–22:00
export const TIME_COL_W = 58;
export const STORAGE_KEY = 'study-planner-state';

export const DAYS = [];
for (let d = START_DAY; d <= END_DAY; d++) DAYS.push(new Date(2026, 3, d));

// Half-hour slots: [h, m] pairs — 26 slots total
export const SLOTS = [];
for (let h = START_HOUR; h <= END_HOUR; h++) {
  SLOTS.push([h, 0]);
  SLOTS.push([h, 30]);
}

export const MONTH_ABR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const DAY_ABR   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const DEFAULT_PRESETS = [
  { name: 'Lecture',     color: '#3b82f6' },
  { name: 'Study',       color: '#10b981' },
  { name: 'Review',      color: '#f59e0b' },
  { name: 'Practice',    color: '#8b5cf6' },
  { name: 'Break',       color: '#ef4444' },
  { name: 'Lab',         color: '#06b6d4' },
  { name: 'Group Study', color: '#f97316' },
  { name: 'Exam Prep',   color: '#ec4899' },
  { name: 'Reading',     color: '#84cc16' },
  { name: 'Free Time',   color: '#6b7280' },
];
