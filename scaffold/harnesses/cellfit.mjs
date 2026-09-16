// Is any element wider than the grid cell containing it. A chip 137px wide in a
// 132px cell paints over the next column and never crosses the frame edge, so
// overflow.mjs structurally cannot see it. It did this on 14 Swarm boards.
import { cfg, boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const hits = await p.evaluate(sel => {
    const out = [];
    document.querySelectorAll(sel).forEach(c => {
      const par = c.parentElement; if (!par) return;
      const cr = c.getBoundingClientRect(), pr = par.getBoundingClientRect();
      if (cr.width > pr.width + 0.5) out.push(`"${c.textContent.trim().slice(0, 20)}" ${Math.round(cr.width)}px in a ${Math.round(pr.width)}px cell`);
    });
    return out;
  }, cfg.cellChildSelector);
  if (hits.length) { affected++; rows.push([id(f), hits.join(', ')]); }
}
await close();
report('boards with an element wider than its cell', boards().length, affected, rows);
