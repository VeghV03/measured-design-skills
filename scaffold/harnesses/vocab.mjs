// Forbidden words outside their permitted zone, per model/policy.json.
// A word list alone produces false findings — a term inside a code sample or a
// filename is not a policy breach. Zones and ignore_selectors are what make the
// count trustworthy. 158 jargon words outside Advanced, then 0.
import { targets, open, report, loadPolicy, skip } from './lib.mjs';
const policy = loadPolicy();
if (!policy) skip('no vocabulary policy — write vocab.policy.json to turn this on.');
const T = await targets();
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  const allowedZones = Object.entries(policy.zones || {})
    .filter(([, z]) => (z.screens || []).includes(board.id)).map(([n]) => n);
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
  // One finding per forbidden word per board, not per occurrence: the same word
  // used four times in one list is one edit, and four fingerprints that all move
  // together would report a four-finding regression on a single typo.
  for (const detail of [...new Set(hits)]) found.push({ target: board.id, detail });
}
await close();
report('boards using a forbidden term outside its zone', T.length, found, { noun: 'forbidden terms' });
