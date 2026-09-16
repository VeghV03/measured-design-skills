// WCAG 2.5.8 Target Size (Minimum): a clickable target under cfg.targetSize CSS
// px on a side is hard to hit precisely — for anyone with a motor or vision
// impairment, and for anyone at all on a touchscreen with a moving vehicle.
import { cfg, boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const hits = await p.evaluate(min => {
    const out = [];
    document.querySelectorAll('button,a,[role=button]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < min || r.height < min)) {
        const name = (el.textContent || '').trim().slice(0, 20) || el.tagName.toLowerCase();
        out.push(`"${name}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    });
    return out;
  }, cfg.targetSize);
  if (hits.length) { affected++; rows.push([id(f), `${hits.length} under ${cfg.targetSize}px — ${hits[0]}`]); }
}
await close();
report(`boards with a target under ${cfg.targetSize}px`, boards().length, affected, rows);
