import { DAYS, SLOTS, TIME_COL_W } from './constants.js';
import { renderBlockLabels } from './grid.js';

export function fitGrid() {
  const toolbarH = document.getElementById('toolbar').offsetHeight;
  const theadEl  = document.querySelector('#grid thead');
  const theadH   = theadEl ? theadEl.offsetHeight : 30;
  const availH   = window.innerHeight - toolbarH - theadH;

  const cellH = Math.max(22, Math.floor(availH / SLOTS.length));
  const cellW = Math.max(50, Math.floor((window.innerWidth - TIME_COL_W) / DAYS.length));

  document.documentElement.style.setProperty('--cell-h', cellH + 'px');
  document.documentElement.style.setProperty('--cell-w', cellW + 'px');
  renderBlockLabels();
}

export function initFit() {
  window.addEventListener('resize', fitGrid);
}
