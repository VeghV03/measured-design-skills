// Does any content fall off the frame, at each supported width.
// The first harness to write and the one that catches the most. It cannot see
// an overflow inside a grid cell — that is cellfit.mjs, and the reason it exists.
import { cfg, targets, open, report } from './lib.mjs';
const T = await targets();
const found = [];
for (const width of cfg.widths) {
  const { p, close } = await open(width);
  for (const board of T) {
    await p.goto(board.url);
    const hits = await p.evaluate(w => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.right > w + 1 || r.left < -1) out.push((el.textContent || el.tagName).trim().slice(0, 30));
      }
      return out;
    }, width);
    // The width is part of the target: a card that only falls off at 768 is a
    // different thing to fix from one that falls off everywhere.
    for (const h of hits) found.push({ target: `${board.id} @${width}`, detail: `off-frame: ${h}` });
  }
  await close();
}
report('board-widths with content off the frame', T.length * cfg.widths.length, found,
  { unit: 'board-widths', noun: 'off-frame' });
