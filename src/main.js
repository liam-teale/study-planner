import './style.css';

import { autoload } from './storage.js';
import { setHistoryCallback, initHistory, updateHistoryBtns } from './history.js';
import { renderPresets, initToolbar } from './toolbar.js';
import { renderGrid } from './grid.js';
import { fitGrid, initFit } from './fit.js';
import { markPastCells, initTimeTicker } from './time.js';
import { initPaint } from './paint.js';
import { initHighlight } from './highlight.js';
import { initModals } from './modals.js';
import { initKeyboard } from './keyboard.js';

// Wire undo/redo to re-render (avoids circular import between history.js and grid.js)
setHistoryCallback(renderGrid);

// Register service worker (production only — Vite does not run SW in dev)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // import.meta.env.BASE_URL is '/' locally and '/study-planner/' on GitHub Pages
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
autoload();       // restore previous session before first render
fitGrid();        // first pass – uses default thead height estimate
renderPresets();
renderGrid();
fitGrid();        // second pass – measures real thead height and corrects
markPastCells();
updateHistoryBtns();

// ── Wire up event handlers ───────────────────────────────────────────────────
initHistory();    // undo/redo buttons
initToolbar();    // erase button, settings modal
initPaint();      // mousedown / drag / right-click on grid
initHighlight();  // row+column hover tinting
initModals();     // double-click label editor
initKeyboard();   // keyboard shortcuts (1–0, E, Ctrl+Z/Y, Escape)
initFit();        // window resize handler
initTimeTicker(); // re-mark past cells every minute
