// Four questions a screen must answer for a person who cannot see it:
// is there a heading, is every control labelled, is any status colour-only,
// is any line of prose too long to track. 42 boards had no heading.
import { boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const hits = await p.evaluate(() => {
    const out = [];
    if (!document.querySelector('h1,h2,h3,[role=heading]')) out.push('no heading element');
    document.querySelectorAll('button,a,input,select,textarea,[role=button]').forEach(c => {
      const name = (c.getAttribute('aria-label') || c.textContent || c.getAttribute('title') || '').trim();
      if (!name) out.push(`unlabelled <${c.tagName.toLowerCase()}>`);
    });
    document.querySelectorAll('[data-status]').forEach(s => {
      if (!(s.textContent || '').trim() && !s.getAttribute('aria-label')) out.push('status carried by colour alone');
    });
    for (const el of document.querySelectorAll('p,li,[data-prose]')) {
      const t = (el.textContent || '').trim();
      if (t.length > 40 && el.getBoundingClientRect().width / parseFloat(getComputedStyle(el).fontSize) > 40)
        out.push(`line measure over 40em: "${t.slice(0, 24)}"`);
    }
    return out;
  });
  if (hits.length) { affected++; rows.push([id(f), `${hits.length} — ${hits[0]}`]); }
}
await close();
report('boards with a structure failure', boards().length, affected, rows);
