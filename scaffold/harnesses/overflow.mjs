// Does any content fall off the frame, at each supported width.
// The first harness to write and the one that catches the most. It cannot see
// an overflow inside a grid cell — that is cellfit.mjs, and the reason it exists.
import { cfg, boards, url, id, open, report } from './lib.mjs';
const rows = [];
let affected = 0;
for (const width of cfg.widths) {
  const { p, close } = await open(width);
  for (const f of boards()) {
    await p.goto(url(f));
    const hits = await p.evaluate(w => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.right > w + 1 || r.left < -1) out.push((el.textContent || el.tagName).trim().slice(0, 30));
      }
      return out;
    }, width);
    if (hits.length) { affected++; rows.push([`${id(f)} @${width}`, `${hits.length} off-frame: ${hits[0]}`]); }
  }
  await close();
}
report('board-widths with content off the frame', boards().length * cfg.widths.length, affected, rows);
