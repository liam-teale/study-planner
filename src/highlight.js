import { state } from './state.js';

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
}

export function initHighlight() {
  document.getElementById('grid').addEventListener('mouseover', e => {
    const td = e.target.closest('.cell');
    if (td) updateHighlight(+td.dataset.h, +td.dataset.d);
  });
  document.getElementById('grid').addEventListener('mouseleave', () => updateHighlight(-1, -1));
}
