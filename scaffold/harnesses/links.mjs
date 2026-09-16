// Does every same-origin link go somewhere. This is the decoupled cousin of
// routes.mjs, and it is deliberately a weaker claim: routes.mjs proves a
// declared route map binds to real labels on real screens, which is what stops
// a route map lying to QA. This only proves nothing 404s. When there is a
// model/, run that one instead — it catches things this structurally cannot.
import { targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const rows = [];
let dead = 0;
const checked = new Map();
for (const board of T) {
  await p.goto(board.url);
  const origin = new URL(board.url).origin;
  const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')]
    .map(a => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 24) })));
  const bad = [];
  for (const { href, text } of hrefs) {
    const u = href.split('#')[0];
    if (!u.startsWith(origin) && !u.startsWith('file://')) continue;   // external is not ours to judge
    if (!checked.has(u)) {
      let ok = false;
      try { const r = await p.goto(u, { waitUntil: 'domcontentloaded' }); ok = !!r && r.status() < 400; }
      catch { ok = false; }
      checked.set(u, ok);
    }
    if (!checked.get(u)) bad.push(`"${text || u}" → ${u.replace(origin, '')}`);
  }
  if (bad.length) { dead += bad.length; rows.push([board.id, [...new Set(bad)].join(', ')]); }
  await p.goto(board.url);
}
await close();
report('links that do not resolve', T.length, dead, rows);
