// Vestibular safety: prefers-reduced-motion is a person telling the OS that
// motion makes them sick, not a hint. An element still transitioning or
// animating once that preference is on did not read it.
import { targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
await p.emulateMedia({ reducedMotion: 'reduce' });
const rows = [];
let affected = 0;
for (const board of T) {
  await p.goto(board.url);
  const hits = await p.evaluate(() => {
    const tags = new Set();
    document.querySelectorAll('body *').forEach(el => {
      const s = getComputedStyle(el);
      if (parseFloat(s.transitionDuration) > 0 || parseFloat(s.animationDuration) > 0)
        tags.add(el.tagName.toLowerCase());
    });
    return [...tags];
  });
  if (hits.length) { affected++; rows.push([board.id, `still animating: ${hits.join(', ')}`]); }
}
await close();
report('boards still animating under reduced motion', T.length, affected, rows);
