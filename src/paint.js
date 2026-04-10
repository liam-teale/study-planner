import { state } from './state.js';
import { DAYS } from './constants.js';
import { cellKey } from './utils.js';
import { pushUndo } from './history.js';
import { autosave } from './storage.js';
import { renderBlockLabels } from './grid.js';
import { markPastCells } from './time.js';
import { renderPresets } from './toolbar.js';

// Return the live <td> for a given day/slot index, or null.
function cellEl(dIdx, hIdx) {
  return document.querySelector(`.cell[data-d="${dIdx}"][data-h="${hIdx}"]`);
}

// Set both borderTop and borderBottom for a cell based on its neighbours.
// Setting both sides of a shared border to 'hidden' is belt-and-suspenders
// for border-collapse: some browsers (Edge) render the solid border-bottom
// of the cell above even when only the cell below has border-top:hidden.
function setCellBorders(td, dIdx, hIdx) {
  const color      = state.cells[cellKey(dIdx, hIdx)]?.color ?? null;
  const aboveColor = hIdx > 0 ? (state.cells[cellKey(dIdx, hIdx - 1)]?.color ?? null) : null;
  const belowColor = state.cells[cellKey(dIdx, hIdx + 1)]?.color ?? null;
  td.style.borderTop    = (color && color === aboveColor) ? 'hidden' : '';
  td.style.borderBottom = (color && color === belowColor) ? 'hidden' : '';
}

// Sweep all cells and reconcile borders with current state.
// Called after mouseup to catch any borders fixBorders() missed (e.g. fast mouse moves).
function reapplyAllBorders() {
  document.querySelectorAll('#grid tbody .cell').forEach(td => {
    setCellBorders(td, +td.dataset.d, +td.dataset.h);
  });
}

// After painting or erasing (dIdx, hIdx), fix borders on that cell and its
// immediate neighbours so intra-block borders stay hidden and inter-block
// borders stay visible — without rebuilding the whole DOM.
function fixBorders(dIdx, hIdx) {
  const td = cellEl(dIdx, hIdx);
  if (td) setCellBorders(td, dIdx, hIdx);

  // Cell above: its borderBottom may now need updating
  const tdAbove = cellEl(dIdx, hIdx - 1);
  if (tdAbove) setCellBorders(tdAbove, dIdx, hIdx - 1);

  // Cell below: its borderTop may now need updating
  const tdBelow = cellEl(dIdx, hIdx + 1);
  if (tdBelow) setCellBorders(tdBelow, dIdx, hIdx + 1);
}

// Erase a single cell: clear state, reset DOM styles, restore weekend tint,
// and fix surrounding borders. Used by both applyTool and the contextmenu handler.
function eraseCell(td, dIdx, hIdx) {
  delete state.cells[cellKey(dIdx, hIdx)];
  td.style.background   = '';
  td.style.borderTop    = '';
  td.style.borderBottom = '';
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
    // Remove any stale .cell-inner (it causes border-collapse rendering artefacts
    // because its z-index stacking context interferes with border-top:hidden).
    // Text labels are rendered by the renderBlockLabels() overlay, not in-cell.
    td.querySelector('.cell-inner')?.remove();
    fixBorders(dIdx, hIdx);
  }
}

export function initPaint() {
  const grid = document.getElementById('grid');
  let _lastDrag = null; // { dIdx, hIdx } of the last cell touched during a drag stroke

  // Middle-click: pick the preset matching the hovered block's colour
  grid.addEventListener('mousedown', e => {
    if (e.button !== 1) return;
    e.preventDefault(); // prevent autoscroll cursor
    const td = e.target.closest('.cell');
    if (!td) return;
    const cellData = state.cells[cellKey(+td.dataset.d, +td.dataset.h)];
    if (!cellData) return;
    const idx = state.presets.findIndex(p => p.color === cellData.color);
    if (idx === -1) return;
    state.selPreset = idx;
    state.activeTool = 'paint';
    document.getElementById('erase-btn').classList.remove('active');
    renderPresets();
  });

  grid.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const td = e.target.closest('.cell');
    if (!td) return;
    e.preventDefault();
    pushUndo();
    state.isDragging = true;
    _lastDrag = { dIdx: +td.dataset.d, hIdx: +td.dataset.h };
    applyTool(td);
  });

  grid.addEventListener('mouseover', e => {
    if (!state.isDragging) return;
    const td = e.target.closest('.cell');
    if (!td) return;

    const dIdx = +td.dataset.d;
    const hIdx = +td.dataset.h;

    // If the mouse skipped cells in the same column, fill the gap.
    if (_lastDrag && _lastDrag.dIdx === dIdx && Math.abs(hIdx - _lastDrag.hIdx) > 1) {
      const step = hIdx > _lastDrag.hIdx ? 1 : -1;
      for (let h = _lastDrag.hIdx + step; h !== hIdx; h += step) {
        if (state.activeTool === 'paint' && state.cells[cellKey(dIdx, h)]) continue;
        const fillTd = cellEl(dIdx, h);
        if (fillTd) applyTool(fillTd);
      }
    }

    _lastDrag = { dIdx, hIdx };

    if (state.activeTool === 'paint') {
      const key = cellKey(dIdx, hIdx);
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
      reapplyAllBorders();
      autosave();
      renderBlockLabels();
      markPastCells();
    }
    state.isDragging = false;
    _lastDrag = null;
  });
}
