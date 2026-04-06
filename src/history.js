import { state } from './state.js';

// Set by main.js to break the circular dep with grid.js
let _afterChange = () => {};
export function setHistoryCallback(fn) { _afterChange = fn; }

export function pushUndo() {
  state.undoStack.push(JSON.stringify(state.cells));
  if (state.undoStack.length > 50) state.undoStack.shift();
  state.redoStack = [];
  updateHistoryBtns();
}

export function undo() {
  if (!state.undoStack.length) return;
  state.redoStack.push(JSON.stringify(state.cells));
  state.cells = JSON.parse(state.undoStack.pop());
  _afterChange();
  updateHistoryBtns();
}

export function redo() {
  if (!state.redoStack.length) return;
  state.undoStack.push(JSON.stringify(state.cells));
  state.cells = JSON.parse(state.redoStack.pop());
  _afterChange();
  updateHistoryBtns();
}

export function updateHistoryBtns() {
  document.getElementById('undo-btn').disabled = state.undoStack.length === 0;
  document.getElementById('redo-btn').disabled = state.redoStack.length === 0;
}

export function initHistory() {
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('redo-btn').addEventListener('click', redo);
}
