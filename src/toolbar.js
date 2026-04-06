import { state } from './state.js';
import { DEFAULT_PRESETS } from './constants.js';
import { renderGrid } from './grid.js';
import { autosave } from './storage.js';

export function renderPresets() {
  const el = document.getElementById('presets');
  el.innerHTML = '';
  state.presets.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'preset-swatch' + (i === state.selPreset && state.activeTool === 'paint' ? ' selected' : '');
    div.title = p.name;
    div.innerHTML = `
      <div class="preset-color" style="background:${p.color}"></div>
      <span class="preset-num">${i === 9 ? '0' : i + 1}</span>
      <span class="preset-label">${p.name}</span>`;
    div.addEventListener('click', () => {
      state.selPreset = i;
      state.activeTool = 'paint';
      renderPresets();
      document.getElementById('erase-btn').classList.remove('active');
    });
    el.appendChild(div);
  });
}

export function initToolbar() {
  document.getElementById('erase-btn').addEventListener('click', () => {
    state.activeTool = state.activeTool === 'erase' ? 'paint' : 'erase';
    document.getElementById('erase-btn').classList.toggle('active', state.activeTool === 'erase');
    renderPresets();
  });

  document.getElementById('settings-btn').addEventListener('click', () => {
    const el = document.getElementById('presets-edit');
    el.innerHTML = '';
    state.presets.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'preset-row';
      row.innerHTML = `
        <span class="pnum">${i === 9 ? '0' : i + 1}</span>
        <input type="color" id="sc-${i}" value="${p.color}">
        <input type="text"  id="sn-${i}" value="${p.name}" placeholder="Preset ${i + 1}" maxlength="20">`;
      el.appendChild(row);
    });
    document.getElementById('settings-modal').classList.add('open');
  });

  document.getElementById('settings-close-btn').addEventListener('click', () => {
    state.presets.forEach((p, i) => {
      p.color = document.getElementById(`sc-${i}`).value;
      p.name  = document.getElementById(`sn-${i}`).value.trim() || `Preset ${i + 1}`;
    });
    document.getElementById('settings-modal').classList.remove('open');
    renderPresets();
    renderGrid();
    autosave();
  });

  document.getElementById('settings-reset-btn').addEventListener('click', () => {
    if (confirm('Reset all presets to defaults?')) {
      state.presets = DEFAULT_PRESETS.map(p => ({ ...p }));
      document.getElementById('settings-modal').classList.remove('open');
      renderPresets();
      renderGrid();
      autosave();
    }
  });
}
