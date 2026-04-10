import { DAYS, SLOTS } from './constants.js';

export function markPastCells() {
  const now = new Date();
  document.querySelectorAll('.cell').forEach(td => {
    const slot      = SLOTS[+td.dataset.h];
    const day       = DAYS[+td.dataset.d];
    const slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot[0], slot[1]);
    const slotEnd   = new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot[0], slot[1] + 30);
    td.classList.toggle('past',    slotEnd <= now);
    td.classList.toggle('current', slotStart <= now && now < slotEnd);
  });
}

export function initTimeTicker() {
  setInterval(markPastCells, 60_000);
}
