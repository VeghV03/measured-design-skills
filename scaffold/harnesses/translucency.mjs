// A translucent layer over text composites that text toward the layer's colour.
// contrast.mjs reads declared colours, so a veil is exactly what it cannot see.
// A white veil at 34% took muted text from 4.74:1 to 2.53:1.
import { cfg, targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  const hits = await p.evaluate(scrim => {
    const lum = c => { const g = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      return .2126 * g(c[0]) + .7152 * g(c[1]) + .0722 * g(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const parse = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const bg = parse(getComputedStyle(el).backgroundColor);
      if (!bg || bg.length < 4) continue;
      const a = bg[3];
      if (a <= .02 || a >= .98) continue;              // opaque or invisible: not a veil
      if (el.closest(scrim)) continue;                  // modals dim on purpose
      const r = el.getBoundingClientRect();
      if (r.width < 200 || r.height < 200) continue;    // a chip tint is not a veil
      for (const t of document.querySelectorAll('body *')) {
        if (t.children.length || !(t.textContent || '').trim() || el.contains(t)) continue;
        const tr = t.getBoundingClientRect();
        if (tr.right < r.left || tr.left > r.right || tr.bottom < r.top || tr.top > r.bottom) continue;
        const fg = parse(getComputedStyle(t).color) || [0, 0, 0];
        const comp = [0, 1, 2].map(i => a * bg[i] + (1 - a) * fg[i]);
        const got = ratio(comp, [255, 255, 255]);
        const text = t.textContent.trim().slice(0, 24);
        if (got < 4.5) out.push({ text, detail: `"${text}" ${got.toFixed(2)}:1 under ${Math.round(a * 100)}%` });
      }
    }
    return out;
  }, cfg.scrimSelector);
  for (const h of hits) found.push({ target: board.id, detail: h.detail, key: `dimmed by a veil: ${h.text}` });
}
await close();
report('boards with text dimmed by a translucent layer', T.length, found, { noun: 'dimmed' });
