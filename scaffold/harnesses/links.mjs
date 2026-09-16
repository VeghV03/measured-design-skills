// Does every same-origin link go somewhere. This is the decoupled cousin of
// routes.mjs, and it is deliberately a weaker claim: routes.mjs proves a declared
// route map binds to real labels on real screens, which is what stops a route map
// lying to QA. This only proves nothing 404s. When there is a model/, run that one.
//
// It needs a served origin. Under file:// a root-absolute href resolves against the
// filesystem root, so every link would read as dead — a finding about the protocol,
// not about the product. The boundary is stated rather than guessed at.
import { targets, open, report, skip } from './lib.mjs';
const T = await targets();
if (!T[0].url.startsWith('http'))
  skip('links needs a served origin — file:// cannot resolve a root-absolute href.',
       'Point target at a running server: { "mode": "crawl", "start": "http://localhost:3000" }');
const { p, close } = await open();
const found = [];
const checked = new Map();
for (const board of T) {
  await p.goto(board.url);
  const origin = new URL(board.url).origin;
  const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')]
    .map(a => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 24) })));
  const seen = new Set();
  for (const { href, text } of hrefs) {
    const u = href.split('#')[0];
    if (!u.startsWith(origin)) continue;                 // external is not ours to judge
    if (!checked.has(u)) {
      // a request, not a navigation — navigating per link races the page it came from
      let ok = false;
      try { ok = (await p.request.fetch(u, { failOnStatusCode: false })).status() < 400; }
      catch { ok = false; }
      checked.set(u, ok);
    }
    if (!checked.get(u) && !seen.has(u)) {
      seen.add(u);
      found.push({ target: board.id, detail: `"${text || u}" → ${u.replace(origin, '')}` });
    }
  }
}
await close();
report('links that do not resolve', T.length, found, { count: 'items' });
