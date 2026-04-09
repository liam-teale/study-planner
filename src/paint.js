import { state } from './state.js';
import { DAYS } from './constants.js';
import { cellKey, contrast } from './utils.js';
import { pushUndo } from './history.js';
import { autosave } from './storage.js';
import { renderBlockLabels } from './grid.js';
import { markPastCells } from './time.js';

// Return the live <td> for a given day/slot index, or null.
function cellEl(dIdx, hIdx) {
  return document.querySelector(`.cell[data-d="${dIdx}"][data-h="${hIdx}"]`);
}

// After painting or erasing (dIdx, hIdx), fix the top-border of that cell
// and the cell immediately below so intra-block borders stay hidden and
// inter-block borders stay visible — without rebuilding the whole DOM.
function fixBorders(dIdx, hIdx) {
  const color = state.cells[cellKey(dIdx, hIdx)]?.color ?? null;

  // This cell's top border
  const td = cellEl(dIdx, hIdx);
  if (td) {
    const aboveColor = state.cells[cellKey(dIdx, hIdx - 1)]?.color ?? null;
    td.style.borderTop = (color && color === aboveColor) ? 'hidden' : '';
  }

  // Cell below: its top border depends on what we just changed above it
  const tdBelow = cellEl(dIdx, hIdx + 1);
  if (tdBelow) {
    const belowColor = state.cells[cellKey(dIdx, hIdx + 1)]?.color ?? null;
    tdBelow.style.borderTop = (belowColor && belowColor === color) ? 'hidden' : '';
  }
}

// Erase a single cell: clear state, reset DOM styles, restore weekend tint,
// and fix surrounding borders. Used by both applyTool and the contextmenu handler.
function eraseCell(td, dIdx, hIdx) {
  delete state.cells[cellKey(dIdx, hIdx)];
  td.style.background = '';
  td.style.borderTop  = '';
  td.title = '';
  td.innerHTML = '';
  const dow = DAYS[dIdx].getDay();
  if (dow === 0 || dow === 6) td.classList.add('weekend-bg');
  fixBorders(dIdx, hIdx);
}

function applyTool(td) {
  const dIdx = +td.dataset.d;
  const hIdx = +td.dataset.h;
  const key  = cellKey(dIdx, hIdx);

  if (state.activeTool === 'erase') {
    eraseCell(td, dIdx, hIdx);
  } else {
    const color = state.presets[state.selPreset].color;
    if (!state.cells[key]) {
      state.cells[key] = { color, text: '' };
    } else {
      // Clear inherited text when the cell is repainted with a different colour
      if (state.cells[key].color !== color) state.cells[key].text = '';
      state.cells[key].color = color;
    }

    td.style.background = color;
    let inner = td.querySelector('.cell-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'cell-inner';
      td.appendChild(inner);
    }
    inner.style.color = contrast(color);
    fixBorders(dIdx, hIdx);
  }
}

export function initPaint() {
  const grid = document.getElementById('grid');

  grid.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const td = e.target.closest('.cell');
    if (!td) return;
    e.preventDefault();
    pushUndo();
    state.isDragging = true;
    applyTool(td);
  });

  grid.addEventListener('mouseover', e => {
    if (!state.isDragging) return;
    const td = e.target.closest('.cell');
    if (!td) return;
    if (state.activeTool === 'paint') {
      const key = cellKey(+td.dataset.d, +td.dataset.h);
      if (state.cells[key]) return; // don't overwrite existing blocks while dragging
    }
    applyTool(td);
  });

  grid.addEventListener('contextmenu', e => {
    const td = e.target.closest('.cell');
    if (!td) return;
    e.preventDefault();
    pushUndo();
    eraseCell(td, +td.dataset.d, +td.dataset.h);
    autosave();
    renderBlockLabels();
    markPastCells();
  });

  document.addEventListener('mouseup', () => {
    if (state.isDragging) {
      autosave();
      renderBlockLabels();
      markPastCells();
    }
    state.isDragging = false;
  });
}
