import { DEFAULT_PRESETS } from './constants.js';

// Shared mutable state — import this object and mutate its properties.
export const state = {
  presets:      DEFAULT_PRESETS.map(p => ({ ...p })),
  cells:        {},   // "dIdx-sIdx" → { color: '#hex', text: 'label' }
  selPreset:    0,
  activeTool:   'paint',
  isDragging:   false,
  editingBlock: null, // { dIdx, start, end, color }
  hlRow:        -1,
  hlCol:        -1,
  undoStack:    [],
  redoStack:    [],
};
