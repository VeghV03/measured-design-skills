// Is any element wider than the grid cell containing it. A chip 137px wide in a
// 132px cell paints over the next column and never crosses the frame edge, so
// overflow.mjs structurally cannot see it. It did this on 14 real boards.
import { cfg, targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const board of T) {
  await p.goto(board.url);
  const hits = await p.evaluate(sel => {
    const out = [];
    document.querySelectorAll(sel).forEach(c => {
      const par = c.parentElement; if (!par) return;
      const cr = c.getBoundingClientRect(), pr = par.getBoundingClientRect();
      if (cr.width > pr.width + 0.5) out.push(`"${c.textContent.trim().slice(0, 20)}" ${Math.round(cr.width)}px in a ${Math.round(pr.width)}px cell`);
    });
    return out;
  }, cfg.cellChildSelector);
  if (hits.length) { affected++; rows.push([board.id, hits.join(', ')]); }
}
await close();
report('boards with an element wider than its cell', T.length, affected, rows);
