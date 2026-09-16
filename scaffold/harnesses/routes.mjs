// Does every declared click route point at text that exists on its source board.
// This is the check the gate also runs, here as a standalone report. Written
// after 22 of 162 routes turned out to point at buttons deleted months
// earlier. Gesture and system routes are exempt from the label check by design —
// they have no clickable label, and counting them as dead deletes real screens.
import { targets, open, report, model, hasModel, skip } from './lib.mjs';
if (!hasModel('routes.json') || !hasModel('screens.json'))
  skip('no model/ — route binding needs declared routes.', 'links.mjs checks a live app instead.');
const T = await targets();
const routes = model('routes.json');
const screens = new Set(model('screens.json').map(s => s.id));
const { p, close } = await open();
const found = [];
const byBoard = {};
for (const r of routes) (byBoard[r.from] ||= []).push(r);
for (const board of T) {
  await p.goto(board.url);
  const text = await p.evaluate(() => document.body.innerText);
  for (const r of byBoard[board.id] || []) {
    if (!screens.has(r.to)) found.push({ target: board.id, detail: `${r.label || r.gesture} → "${r.to}" is not a screen` });
    else if (r.via === 'click' && !text.includes(r.label)) found.push({ target: board.id, detail: `"${r.label}" is not on the board` });
    else if (r.via === 'gesture' && !(r.gesture || '').trim()) found.push({ target: board.id, detail: `gesture route to ${r.to} has no description` });
  }
}
await close();
const unreachable = [...screens].filter(s => !routes.some(r => r.to === s));
if (unreachable.length) console.log(`  unreachable by any via: ${unreachable.join(', ')}`);
report(`declared routes that do not bind (of ${routes.length})`, T.length, found, { count: 'items' });
