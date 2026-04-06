import { state } from './state.js';
import { DAYS } from './constants.js';
import { cellKey, contrast } from './utils.js';
import { pushUndo } from './history.js';
import { autosave } from './storage.js';

function applyTool(td) {
  const dIdx = +td.dataset.d;
  const hIdx = +td.dataset.h;
  const key  = cellKey(dIdx, hIdx);

  if (state.activeTool === 'erase') {
    delete state.cells[key];
    td.style.background = '';
    td.title = '';
    td.innerHTML = '';
    const dow = DAYS[dIdx].getDay();
    if (dow === 0 || dow === 6) td.classList.add('weekend-bg');
  } else {
    const color = state.presets[state.selPreset].color;
    if (!state.cells[key]) state.cells[key] = { color, text: '' };
    else state.cells[key].color = color;

    td.style.background = color;
    let inner = td.querySelector('.cell-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'cell-inner';
      td.appendChild(inner);
    }
    inner.style.color = contrast(color);
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
    if (td) applyTool(td);
  });

  grid.addEventListener('contextmenu', e => {
    const td = e.target.closest('.cell');
    if (!td) return;
    e.preventDefault();
    const key = cellKey(+td.dataset.d, +td.dataset.h);
    pushUndo();
    delete state.cells[key];
    td.style.background = '';
    td.title = '';
    td.innerHTML = '';
    const dow = DAYS[+td.dataset.d].getDay();
    if (dow === 0 || dow === 6) td.classList.add('weekend-bg');
    autosave();
  });

  document.addEventListener('mouseup', () => {
    if (state.isDragging) autosave();
    state.isDragging = false;
  });
}
