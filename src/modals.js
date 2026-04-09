import { state } from './state.js';
import { DAYS, SLOTS, MONTH_ABR, DAY_ABR } from './constants.js';
import { cellKey, fmtSlotFull, nextSlot } from './utils.js';
import { getBlock } from './blocks.js';
import { pushUndo } from './history.js';
import { renderGrid } from './grid.js';
import { autosave } from './storage.js';

function saveText() {
  if (!state.editingBlock) return;
  const text = document.getElementById('text-input').value;
  pushUndo();
  const { dIdx, start, end } = state.editingBlock;
  // Store label on every cell so split blocks each retain the text
  for (let s = start; s <= end; s++) {
    const key = cellKey(dIdx, s);
    if (state.cells[key]) state.cells[key].text = text;
  }
  document.getElementById('text-modal').classList.remove('open');
  renderGrid();
  autosave();
}

export function initModals() {
  // Open label editor on double-click
  document.getElementById('grid').addEventListener('dblclick', e => {
    const td = e.target.closest('.cell');
    if (!td) return;
    const dIdx = +td.dataset.d;
    const sIdx = +td.dataset.h;
    state.editingBlock = getBlock(dIdx, sIdx);
    if (!state.editingBlock) return;

    const day       = DAYS[dIdx];
    const startSlot = SLOTS[state.editingBlock.start];
    const endSlot   = nextSlot(SLOTS[state.editingBlock.end]);
    document.getElementById('text-modal-info').textContent =
      `${MONTH_ABR[day.getMonth()]} ${day.getDate()} (${DAY_ABR[day.getDay()]})  ·  ${fmtSlotFull(startSlot)} – ${fmtSlotFull(endSlot)}`;
    document.getElementById('text-input').value =
      state.cells[cellKey(dIdx, state.editingBlock.start)]?.text || '';
    document.getElementById('text-modal').classList.add('open');
    setTimeout(() => document.getElementById('text-input').focus(), 50);
  });

  document.getElementById('text-save-btn').addEventListener('click', saveText);
  document.getElementById('text-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveText();
  });

  document.getElementById('text-clear-btn').addEventListener('click', () => {
    if (!state.editingBlock) return;
    pushUndo();
    const { dIdx, start, end } = state.editingBlock;
    for (let s = start; s <= end; s++) {
      const key = cellKey(dIdx, s);
      if (state.cells[key]) state.cells[key].text = '';
    }
    document.getElementById('text-modal').classList.remove('open');
    renderGrid();
    autosave();
  });

  document.getElementById('text-cancel-btn').addEventListener('click', () => {
    document.getElementById('text-modal').classList.remove('open');
  });

  document.getElementById('text-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('text-modal').classList.remove('open');
  });
}
