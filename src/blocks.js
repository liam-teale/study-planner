import { state } from './state.js';
import { DAYS, SLOTS } from './constants.js';
import { cellKey } from './utils.js';

export function getBlock(dIdx, sIdx) {
  const color = state.cells[cellKey(dIdx, sIdx)]?.color;
  if (!color) return null;
  let start = sIdx, end = sIdx;
  while (start > 0 && state.cells[cellKey(dIdx, start - 1)]?.color === color) start--;
  while (end < SLOTS.length - 1 && state.cells[cellKey(dIdx, end + 1)]?.color === color) end++;
  return { dIdx, start, end, color };
}

export function detectBlocks() {
  const blocks = [];
  DAYS.forEach((_, dIdx) => {
    let i = 0;
    while (i < SLOTS.length) {
      const color = state.cells[cellKey(dIdx, i)]?.color;
      if (!color) { i++; continue; }
      let j = i + 1;
      while (j < SLOTS.length && state.cells[cellKey(dIdx, j)]?.color === color) j++;
      blocks.push({ dIdx, start: i, end: j - 1, color });
      i = j;
    }
  });
  return blocks;
}
