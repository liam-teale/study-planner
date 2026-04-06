import { state } from './state.js';
import { STORAGE_KEY } from './constants.js';

export function autosave() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ presets: state.presets, cells: state.cells }));
  } catch (e) { /* storage full – silently ignore */ }
}

export function autoload() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.presets) state.presets = data.presets;
    if (data.cells)   state.cells   = data.cells;
  } catch (e) { /* corrupt data – start fresh */ }
}
