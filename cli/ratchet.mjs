// Baseline, waivers, and the comparison between them and a run.
//
// Nobody fixes 158 things. Everybody can stop the 159th. A baseline freezes what
// is already there so a run can say the only sentence that changes behaviour:
// this commit added one. Findings leaving the baseline are reported too — a fix
// that nothing notices is a fix nobody gets credit for.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const BASELINE = 'measured-design.baseline.json';
export const WAIVERS = 'measured-design.waivers.json';

const read = p => JSON.parse(readFileSync(p, 'utf8'));

export function loadBaseline(dir) {
  const p = join(dir, BASELINE);
  return existsSync(p) ? read(p) : null;
}

export function writeBaseline(dir, run) {
  const findings = {};
  for (const f of run.findings) findings[f.fingerprint] = { check: f.check, target: f.target, detail: f.detail };
  const body = {
    version: 1,
    recordedAt: new Date().toISOString(),
    // Which checks were actually measured. A baseline recorded while vocab was
    // skipped must not later read as "vocab was clean that day".
    checks: run.checks.map(c => ({ check: c.check, ...(c.skipped ? { skipped: c.skipped } : { affected: c.affected }) })),
    findings,
  };
  writeFileSync(join(dir, BASELINE), JSON.stringify(body, null, 2) + '\n');
  return Object.keys(findings).length;
}

// A waiver is a decision, and a decision that nobody wrote a reason for is an
// opinion that won. `why` is required; `until` is not, but a waiver without one
// is reported every run so it cannot quietly become permanent.
export function loadWaivers(dir, today = new Date()) {
  const p = join(dir, WAIVERS);
  if (!existsSync(p)) return { active: new Map(), expired: [], malformed: [], forever: [] };
  const list = read(p).waivers || [];
  const active = new Map(), expired = [], malformed = [], forever = [];
  for (const w of list) {
    if (!w.fingerprint || !String(w.why || '').trim()) { malformed.push(w); continue; }
    if (w.until && new Date(w.until) < today) { expired.push(w); continue; }
    if (!w.until) forever.push(w);
    active.set(w.fingerprint, w);
  }
  return { active, expired, malformed, forever };
}

export function addWaiver(dir, waiver) {
  const p = join(dir, WAIVERS);
  const body = existsSync(p) ? read(p) : { waivers: [] };
  body.waivers = (body.waivers || []).filter(w => w.fingerprint !== waiver.fingerprint);
  body.waivers.push(waiver);
  writeFileSync(p, JSON.stringify(body, null, 2) + '\n');
}

export function compare(run, baseline, waivers) {
  const known = new Set(Object.keys(baseline?.findings || {}));
  const seen = new Set(run.findings.map(f => f.fingerprint));
  const fresh = [], waived = [];
  for (const f of run.findings) {
    if (waivers.active.has(f.fingerprint)) waived.push({ ...f, waiver: waivers.active.get(f.fingerprint) });
    else if (!known.has(f.fingerprint)) fresh.push(f);
  }
  const fixed = [...known].filter(fp => !seen.has(fp))
    .map(fp => ({ fingerprint: fp, ...baseline.findings[fp] }));
  const stale = [...waivers.active.values()].filter(w => !seen.has(w.fingerprint));
  return {
    fresh, fixed, waived, stale,
    baselined: run.findings.filter(f => known.has(f.fingerprint) && !waivers.active.has(f.fingerprint)).length,
  };
}
