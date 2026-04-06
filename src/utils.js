export function fmtHour(h) {
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function fmtSlot([h, m]) {
  if (m === 0) return fmtHour(h);
  return `${h > 12 ? h - 12 : h}:30`;
}

export function fmtSlotFull([h, m]) {
  const hd = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const suf = h < 12 ? 'AM' : 'PM';
  return `${hd}:${m.toString().padStart(2, '0')} ${suf}`;
}

export function nextSlot([h, m]) { return m === 0 ? [h, 30] : [h + 1, 0]; }

export function contrast(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.52 ? '#1a1a1a' : '#ffffff';
}

export function cellKey(d, h) { return `${d}-${h}`; }
