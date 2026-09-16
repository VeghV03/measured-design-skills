// Element count per screen at the real data scale, not the demo scale.
// A list looks calm with six rows and unusable with six hundred. Set
// densityBudget in harness.config.json from the scale the product actually sees.
import { cfg, boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const n = await p.evaluate(() => document.querySelectorAll('body *').length);
  if (n > cfg.densityBudget) { affected++; rows.push([id(f), `${n} elements, budget ${cfg.densityBudget}`]); }
}
await close();
report(`boards over the density budget`, boards().length, affected, rows);
