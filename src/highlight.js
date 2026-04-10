import { state } from './state.js';
import { getBlock } from './blocks.js';

function clearBlockHighlight() {
  if (!state.hlBlock) return;
  const { dIdx, start, end } = state.hlBlock;
  for (let s = start; s <= end; s++) {
    document.querySelector(`.cell[data-d="${dIdx}"][data-h="${s}"]`)?.classList.remove('block-hl');
    document.querySelector(`td.col-time[data-h="${s}"]`)?.classList.remove('block-hl');
  }
  state.hlBlock = null;
}

function applyBlockHighlight(dIdx, sIdx) {
  const block = getBlock(dIdx, sIdx);
  if (!block) { clearBlockHighlight(); return; }

  // No change needed if same block
  if (state.hlBlock &&
      state.hlBlock.dIdx === block.dIdx &&
      state.hlBlock.start === block.start &&
      state.hlBlock.end === block.end) return;

  clearBlockHighlight();
  state.hlBlock = block;
  for (let s = block.start; s <= block.end; s++) {
    document.querySelector(`.cell[data-d="${dIdx}"][data-h="${s}"]`)?.classList.add('block-hl');
    document.querySelector(`td.col-time[data-h="${s}"]`)?.classList.add('block-hl');
  }
}

export function updateHighlight(row, col) {
  if (row === state.hlRow && col === state.hlCol) return;

  if (state.hlRow >= 0) {
    document.querySelectorAll(`.cell[data-h="${state.hlRow}"]`).forEach(c => c.classList.remove('row-hl'));
    document.querySelector(`td.col-time[data-h="${state.hlRow}"]`)?.classList.remove('row-hl');
  }
  if (state.hlCol >= 0) {
    document.querySelectorAll(`.cell[data-d="${state.hlCol}"]`).forEach(c => c.classList.remove('col-hl'));
    document.querySelector(`thead th[data-d="${state.hlCol}"]`)?.classList.remove('col-hl');
  }

  state.hlRow = row;
  state.hlCol = col;

  if (state.hlRow >= 0) {
    document.querySelectorAll(`.cell[data-h="${state.hlRow}"]`).forEach(c => c.classList.add('row-hl'));
    document.querySelector(`td.col-time[data-h="${state.hlRow}"]`)?.classList.add('row-hl');
  }
  if (state.hlCol >= 0) {
    document.querySelectorAll(`.cell[data-d="${state.hlCol}"]`).forEach(c => c.classList.add('col-hl'));
    document.querySelector(`thead th[data-d="${state.hlCol}"]`)?.classList.add('col-hl');
  }

  if (row >= 0 && col >= 0) {
    applyBlockHighlight(col, row);
  } else {
    clearBlockHighlight();
  }
}

export function initHighlight() {
  document.getElementById('grid').addEventListener('mouseover', e => {
    const td = e.target.closest('.cell');
    if (td) updateHighlight(+td.dataset.h, +td.dataset.d);
  });
  document.getElementById('grid').addEventListener('mouseleave', () => updateHighlight(-1, -1));
  // Clear highlight when window loses focus (e.g. Snipping Tool, Alt+Tab)
  // so it doesn't get frozen into screenshots
  window.addEventListener('blur', () => updateHighlight(-1, -1));
}
