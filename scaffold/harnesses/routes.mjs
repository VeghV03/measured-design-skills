// Does every declared click route point at text that exists on its source board.
// This is the check the gate also runs, here as a standalone report. Written
// after 22 of 162 routes turned out to point at buttons deleted months
// earlier. Gesture and system routes are exempt from the label check by design —
// they have no clickable label, and counting them as dead deletes real screens.
import { boards, url, id, open, report, model } from './lib.mjs';
const routes = model('routes.json');
const screens = new Set(model('screens.json').map(s => s.id));
const { p, close } = await open();
const rows = [];
let dead = 0;
const byBoard = {};
for (const r of routes) (byBoard[r.from] ||= []).push(r);
for (const f of boards()) {
  await p.goto(url(f));
  const board = id(f);
  const mine = byBoard[board] || [];
  const text = await p.evaluate(() => document.body.innerText);
  const bad = [];
  for (const r of mine) {
    if (!screens.has(r.to)) { bad.push(`${r.label || r.gesture} → "${r.to}" is not a screen`); continue; }
    if (r.via === 'click' && !text.includes(r.label)) bad.push(`"${r.label}" is not on the board`);
    if (r.via === 'gesture' && !(r.gesture || '').trim()) bad.push(`gesture route to ${r.to} has no description`);
  }
  if (bad.length) { dead += bad.length; rows.push([board, bad.join(', ')]); }
}
await close();
const unreachable = [...screens].filter(s => !routes.some(r => r.to === s));
if (unreachable.length) console.log(`  unreachable by any via: ${unreachable.join(', ')}`);
report(`declared routes that do not bind (of ${routes.length})`, boards().length, dead, rows);
