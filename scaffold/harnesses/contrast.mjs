// Every text node against its actual composited background. Run once per theme.
// Reads declared colours — which is exactly why translucency.mjs also exists.
import { targets, open, report } from './lib.mjs';
const T = await targets();
const theme = process.argv[2] || 'light';
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
  const hits = await p.evaluate(() => {
    const lum = c => { const g = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      return .2126 * g(c[0]) + .7152 * g(c[1]) + .0722 * g(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const parse = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
    const bgOf = el => { for (let n = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && (c.length < 4 || c[3] > .95)) return c.slice(0, 3); } return [255, 255, 255]; };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length || !(el.textContent || '').trim()) continue;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
      const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
      const r = ratio(parse(cs.color).slice(0, 3), bgOf(el));
      const text = el.textContent.trim().slice(0, 24);
      if (r < need) out.push({ text, detail: `"${text}" ${r.toFixed(2)}:1` });
    }
    return out;
  });
  // The theme is part of the check, not the board: the same label can fail in dark
  // and pass in light, and one identity for both would hide whichever ran second.
  for (const h of hits) found.push({ target: board.id, detail: h.detail, key: `under contrast threshold: ${h.text}` });
}
await close();
report(`boards with a contrast failure (${theme})`, T.length, found,
  { check: `contrast-${theme}`, noun: 'under threshold' });
