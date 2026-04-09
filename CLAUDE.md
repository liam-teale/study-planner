# Study Planner – Developer Documentation

## Quick Start

```bash
npm install
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

## What This Is

A vanilla-JS PWA for scheduling study blocks across a fixed date range (Apr 5–23, 2026, 8 AM–9 PM in 30-minute slots). No framework — direct DOM mutation is intentional for drag-paint performance.

---

## File Structure

```
index.html          HTML shell — just markup, no inline JS/CSS
vite.config.js      Vite config (port 5173, publicDir: public/)
package.json        devDependency: vite

public/
  manifest.json     PWA manifest (start_url: /)
  sw.js             Service worker — network-first, cache-fallback
  icon.svg          App icon (calendar grid SVG)

src/
  main.js           Entry point — bootstraps app, wires all modules
  style.css         All CSS

  constants.js      DAYS, SLOTS, presets defaults, TIME_COL_W, STORAGE_KEY
  utils.js          Pure helpers: fmtSlot, contrast, cellKey, nextSlot
  state.js          Shared mutable state object (cells, presets, tool state)

  history.js        Undo/redo stack — calls renderGrid via callback set in main.js
  storage.js        localStorage autosave/autoload
  blocks.js         getBlock(), detectBlocks() — contiguous color-run detection

  grid.js           renderGrid(), renderBlockLabels() — full DOM rebuild
  paint.js          Event delegation on #grid for mousedown/drag/right-click
  highlight.js      Row/col hover highlight — event delegation on #grid
  modals.js         Double-click label editor + settings modal
  toolbar.js        Preset swatches, erase button, settings modal trigger
  time.js           markPastCells() — darkens elapsed 30-min slots
  fit.js            fitGrid() — calculates --cell-h / --cell-w CSS vars
  keyboard.js       1–0 preset select, E eraser, Ctrl+Z/Y undo/redo, Escape
```

---

## Key Concepts

### State (`src/state.js`)
All shared mutable state lives in a single exported object:
```js
state.cells        // { "dIdx-sIdx": { color: "#hex", text: "label" } }
state.presets      // [{ name, color }, ...]  (10 presets)
state.selPreset    // index 0–9
state.activeTool   // 'paint' | 'erase'
state.isDragging   // boolean — set by paint.js
state.editingBlock // { dIdx, start, end, color } | null — set by modals.js
state.hlRow/hlCol  // currently highlighted row/col (-1 = none)
state.undoStack / state.redoStack  // JSON-stringified cells snapshots
```

### Cell Key
Cells are stored by `"dIdx-sIdx"` e.g. `"3-5"` = Apr 8, 10:30 AM.
- `dIdx` = index into `DAYS` (0-based, Apr 5 = 0)
- `sIdx` = index into `SLOTS` (0-based, 8:00 AM = 0, 8:30 AM = 1, ...)

**IMPORTANT:** The localStorage key is `study-planner-state`. If you rename it or change the data schema, existing user data will not load.

### Viewport Fitting
`fitGrid()` (in `src/fit.js`) sets `--cell-h` and `--cell-w` CSS custom properties so the grid exactly fills the viewport without scrolling. It's called twice at init:
1. Before `renderGrid()` — uses estimated thead height
2. After `renderGrid()` — measures actual thead height and corrects

### Block Labels
`renderBlockLabels()` (in `src/grid.js`) creates an absolutely-positioned overlay `<div id="block-labels">` on top of the grid. Labels use `--cell-h` and `--cell-w` to position absolutely over contiguous same-color runs. The overlay has `pointer-events: none` so cells stay interactive.

### Undo/Redo
`history.js` stores JSON snapshots of `state.cells` (not the full state). After an undo/redo, it calls a callback registered via `setHistoryCallback(fn)` in `main.js`. This avoids a circular import between `history.js` and `grid.js`.

### Highlight CSS Trick
Hover highlighting uses `background-image: linear-gradient(rgba(...))` instead of `background-color`, so it layers over cell color fills (which are inline `style.background`) without replacing them.

### Event Delegation
Paint, highlight, and modal events all use event delegation on `#grid` rather than per-cell listeners. This is important because `renderGrid()` does a full DOM rebuild — delegation avoids re-attaching hundreds of listeners on every re-render.

### Re-render Rule — always call `markPastCells()` after `renderGrid()`
`renderGrid()` does a full DOM rebuild, which wipes every `.past` CSS class that `markPastCells()` had applied. **Any code that calls `renderGrid()` must call `markPastCells()` immediately afterwards**, or past-time slots will lose their darkening. The history callback in `main.js` follows this rule, as do `modals.js` and the undo/redo path.

`paint.js` deliberately does **not** call `renderGrid()` — it mutates the DOM in-place so that `dblclick` detection is not broken by element replacement between the two clicks. It calls `renderBlockLabels()` + `markPastCells()` instead.

### Service Worker
The SW is only registered in production builds (`import.meta.env.PROD` in `main.js`). During Vite dev (`npm run dev`), no SW is active — this prevents the caching problems that plagued the old single-file setup. The SW uses a pure network-first strategy.

---

## Common Tasks

### Change the date range
Edit `START_DAY` / `END_DAY` in `src/constants.js`. `DAYS` is built from these.

### Change the time range
Edit `START_HOUR` / `END_HOUR` in `src/constants.js`. `SLOTS` is built from these.

### Change default preset colors/names
Edit `DEFAULT_PRESETS` in `src/constants.js`. These are only the defaults — user changes are saved to localStorage.

### Add a new feature
1. Create `src/myfeature.js` with an `initMyFeature()` export
2. Import and call it in `src/main.js`
3. If it needs to trigger a re-render, import `renderGrid` from `src/grid.js` — and always follow it with `markPastCells()` from `src/time.js` (see Re-render Rule above)

### Clearing saved data (dev/debug)
In the browser console:
```js
localStorage.removeItem('study-planner-state');
location.reload();
```

---

## Data Persistence

User data (painted cells + custom presets) is saved to `localStorage` under the key `study-planner-state` on every paint stroke, erase, label edit, and preset change. It survives:
- Page reloads
- Code changes / hot module reloads
- SW cache clears

It does **not** survive:
- Clearing browser storage
- Changing `STORAGE_KEY` in `constants.js`
- Breaking changes to the `{ presets, cells }` data shape
