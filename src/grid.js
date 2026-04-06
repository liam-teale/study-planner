import { state } from './state.js';
import { DAYS, SLOTS, MONTH_ABR, DAY_ABR, TIME_COL_W } from './constants.js';
import { cellKey, fmtSlot, contrast } from './utils.js';
import { detectBlocks } from './blocks.js';
import { updateHighlight } from './highlight.js';

export function renderBlockLabels() {
  const tbody = document.querySelector('#grid tbody');
  if (!tbody) return;
  document.getElementById('block-labels')?.remove();

  const cellH  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-h'));
  const cellW  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-w'));
  const theadH = document.querySelector('#grid thead').offsetHeight;

  const overlay = document.createElement('div');
  overlay.id = 'block-labels';

  detectBlocks().forEach(({ dIdx, start, end, color }) => {
    const label = state.cells[cellKey(dIdx, start)]?.text;
    if (!label) return;

    const el = document.createElement('div');
    el.className = 'block-label';
    el.style.top    = (theadH + start * cellH) + 'px';
    el.style.left   = (TIME_COL_W + dIdx * cellW) + 'px';
    el.style.width  = cellW + 'px';
    el.style.height = ((end - start + 1) * cellH) + 'px';
    el.style.color  = contrast(color);
    el.textContent  = label;
    overlay.appendChild(el);
  });

  document.getElementById('grid-wrapper').appendChild(overlay);
}

export function renderGrid() {
  const table = document.getElementById('grid');
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const thead = document.createElement('thead');
  const hr    = document.createElement('tr');

  const corner = document.createElement('th');
  corner.className = 'col-time';
  hr.appendChild(corner);

  DAYS.forEach((day, dIdx) => {
    const th  = document.createElement('th');
    const dow = day.getDay();
    const d0  = new Date(day); d0.setHours(0, 0, 0, 0);
    if (d0.getTime() === today.getTime()) th.classList.add('today');
    if (dow === 0 || dow === 6) th.classList.add('weekend');
    th.dataset.d = dIdx;
    th.innerHTML = `${MONTH_ABR[day.getMonth()]} ${day.getDate()}<br><span style="font-weight:400;opacity:0.7">${DAY_ABR[dow]}</span>`;
    hr.appendChild(th);
  });

  thead.appendChild(hr);

  const tbody = document.createElement('tbody');
  SLOTS.forEach((slot, sIdx) => {
    const tr = document.createElement('tr');

    const tc = document.createElement('td');
    tc.className = 'col-time' + (slot[1] === 30 ? ' half-hour' : '');
    tc.dataset.h = sIdx;
    tc.textContent = fmtSlot(slot);
    tr.appendChild(tc);

    DAYS.forEach((day, dIdx) => {
      const td  = document.createElement('td');
      const dow = day.getDay();
      td.className = 'cell' +
        (dow === 0 || dow === 6 ? ' weekend-bg' : '') +
        (slot[1] === 30 ? ' half-hour-cell' : '');
      td.dataset.d = dIdx;
      td.dataset.h = sIdx;

      const data = state.cells[cellKey(dIdx, sIdx)];
      if (data) td.style.background = data.color;

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.innerHTML = '';
  table.appendChild(thead);
  table.appendChild(tbody);
  renderBlockLabels();

  // Re-apply hover highlight after re-render
  if (state.hlRow >= 0 || state.hlCol >= 0) {
    const r = state.hlRow, c = state.hlCol;
    state.hlRow = -1; state.hlCol = -1;
    updateHighlight(r, c);
  }
}
