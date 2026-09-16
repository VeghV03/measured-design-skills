// Forbidden words outside their permitted zone, per model/policy.json.
// A word list alone produces false findings — a term inside a code sample or a
// filename is not a policy breach. Zones and ignore_selectors are what make the
// count trustworthy. Swarm: 158 jargon words outside Advanced, then 0.
import { boards, url, id, open, report, model } from './lib.mjs';
const policy = model('policy.json');
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const board = id(f);
  const allowedZones = Object.entries(policy.zones || {})
    .filter(([, z]) => (z.screens || []).includes(board)).map(([n]) => n);
  const hits = await p.evaluate(({ policy, allowedZones }) => {
    const ignore = (policy.scan && policy.scan.ignore_selectors) || [];
    const zoneSel = Object.entries(policy.zones || {})
      .map(([n, z]) => [n, (z.selectors || []).join(',')]).filter(([, s]) => s);
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || ignore.some(s => el.closest(s))) continue;
      const inZones = zoneSel.filter(([, s]) => el.closest(s)).map(([z]) => z);
      const text = (n.nodeValue || '').toLowerCase();
      for (const t of policy.terms || []) {
        if (!text.includes(t.word.toLowerCase())) continue;
        const allow = new Set([...(t.allow_zones || [])]);
        if (inZones.some(z => allow.has(z)) || allowedZones.some(z => allow.has(z))) continue;
        out.push(`"${t.word}" (${t.severity || 'error'})`);
      }
    }
    return out;
  }, { policy, allowedZones });
  if (hits.length) { affected++; rows.push([board, [...new Set(hits)].join(', ')]); }
}
await close();
report('boards using a forbidden term outside its zone', boards().length, affected, rows);
