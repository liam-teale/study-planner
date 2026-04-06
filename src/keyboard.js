import { state } from './state.js';
import { undo, redo } from './history.js';
import { renderPresets } from './toolbar.js';

export function initKeyboard() {
  document.addEventListener('keydown', e => {
    // Undo/redo work even inside inputs
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }

    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      return;
    }
    if (e.key === 'e' || e.key === 'E') { document.getElementById('erase-btn').click(); return; }

    const n = e.key === '0' ? 9 : parseInt(e.key) - 1;
    if (n >= 0 && n <= 9) {
      state.selPreset = n;
      state.activeTool = 'paint';
      renderPresets();
      document.getElementById('erase-btn').classList.remove('active');
    }
  });
}
