// Shared plumbing so each check stays under thirty lines and says one thing.
//
// Config is found in the project first (measured-design.config.json beside the
// thing being checked), then beside this file. Relative paths resolve against
// whichever config was found, not against this directory — otherwise a pack
// installed under node_modules resolves every path into itself.
import { chromium } from 'playwright';
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { createHash } from 'crypto';

const here = new URL('.', import.meta.url).pathname;
const found = [join(process.cwd(), 'measured-design.config.json'),
               join(here, 'harness.config.json')].find(existsSync);
const cfgDir = found ? dirname(found) : here;

export const cfg = Object.assign({
  boards: '../../boards',
  model: '../../model',
  widths: [1440, 1024, 768],
  height: 900,
  executablePath: null,
  scrimSelector: '.scrim',
  cellChildSelector: '.chip',
  densityBudget: 400,
  targetSize: 24
}, found ? JSON.parse(readFileSync(found, 'utf8')) : {});

export const modelDir = resolve(cfgDir, cfg.model);
export const hasModel = n => existsSync(join(modelDir, n));
export const model = n => JSON.parse(readFileSync(join(modelDir, n), 'utf8'));

// The vocabulary policy is the one authored thing a decoupled run still needs.
// A word list cannot be inferred from a DOM, so it is asked for on its own
// rather than dragging in the other seven model files.
export function loadPolicy() {
  if (hasModel('policy.json')) return model('policy.json');
  const p = resolve(cfgDir, cfg.vocabPolicy || 'vocab.policy.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

const idFromUrl = u => {
  const p = new URL(u).pathname.replace(/\/+$/, '');
  return p ? p.replace(/^\//, '').replace(/\.html?$/, '').replace(/\//g, '-') : 'index';
};

async function crawl(t) {
  const origin = new URL(t.start).origin, limit = t.limit || 50;
  const b = await chromium.launch(cfg.executablePath ? { executablePath: cfg.executablePath } : {});
  const p = await b.newPage();
  // Dedupe on the reported name, not the URL: "/" and "/index.html" are one page,
  // and two targets sharing a name would double every count taken from them.
  const seen = new Set(), named = new Set(), out = [], queue = [t.start];
  while (queue.length && out.length < limit) {
    const u = queue.shift().split('#')[0];
    if (seen.has(u)) continue;
    seen.add(u);
    let res = null;
    try { res = await p.goto(u, { waitUntil: 'domcontentloaded' }); } catch { continue; }
    if (!res || res.status() >= 400) continue;
    const name = idFromUrl(u);
    if (!named.has(name)) { named.add(name); out.push({ id: name, url: u }); }
    for (const l of await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href)))
      if (l.startsWith(origin)) queue.push(l);
  }
  await b.close();
  return out;
}

// What is being checked: a folder of built boards, an explicit route list, or a
// crawl. Ten of the thirteen checks never need to know which — they take a url and
// a name. The two that read model/ are the two that cannot run without it.
function fail(why) {
  console.error(`\n  ${why}.`);
  console.error(`  Point "target" in ${found || 'harness.config.json'} at what you want checked:`);
  console.error('    { "target": { "mode": "dir",   "dir": "./dist" } }');
  console.error('    { "target": { "mode": "crawl", "start": "http://localhost:3000" } }');
  console.error('  Or run `npx measured-design init` to write one.\n');
  process.exit(2);
}

let cached = null;
export async function targets() {
  if (cached) return cached;
  const t = cfg.target || { mode: 'dir', dir: cfg.boards };
  if (t.mode === 'urls')
    cached = t.routes.map(r => ({ id: idFromUrl(new URL(r, t.base).href), url: new URL(r, t.base).href }));
  else if (t.mode === 'crawl')
    cached = await crawl(t);
  else {
    const d = resolve(cfgDir, t.dir || cfg.boards);
    if (!existsSync(d)) fail(`no boards at ${d}`);
    cached = readdirSync(d).filter(f => f.endsWith('.html')).sort()
      .map(f => ({ id: f.replace(/\.html$/, ''), url: 'file://' + join(d, f) }));
  }
  if (!cached.length) fail('the target resolved to nothing to check');
  return cached;
}

export async function open(width = cfg.widths[0]) {
  const b = await chromium.launch(cfg.executablePath ? { executablePath: cfg.executablePath } : {});
  const p = await b.newPage({ viewport: { width, height: cfg.height } });
  return { b, p, close: () => b.close() };
}

// A finding is identified by what it is, not by where it sat in this run's output.
// Volatile numbers are normalised out of the identity: a contrast ratio drifting
// from 3.12 to 3.40 is the same finding, and a fingerprint that rotated on it would
// report one fix and one regression on a day nothing happened.
const norm = s => String(s).toLowerCase().replace(/[\d.]+/g, '#').replace(/\s+/g, ' ').trim();
export const fingerprint = (check, target, key) =>
  createHash('sha256').update(`${check} ${target} ${norm(key)}`).digest('hex').slice(0, 12);

// One number, one line, every time. Nothing else prints a summary.
//
// Findings arrive one per hit, not one per board. Three contrast failures on one
// screen are three things a person can fix, waive or regress independently, and
// collapsing them into "board affected" makes two of the three unaddressable.
// The printed shape still groups by board, because that is how the number reads.
export function report(label, total, findings = [], opts = {}) {
  const check = opts.check || basename(process.argv[1] || 'check', '.mjs');
  const records = findings.map(f => ({
    check,
    target: f.target,
    detail: f.detail,
    fingerprint: fingerprint(check, f.target, f.key ?? f.detail),
  }));

  const byTarget = new Map();
  for (const r of records) {
    if (!byTarget.has(r.target)) byTarget.set(r.target, []);
    byTarget.get(r.target).push(r);
  }
  for (const [target, rs] of byTarget) {
    const noun = opts.noun ? ` ${opts.noun}` : '';
    console.log(rs.length === 1
      ? `  ${target}: ${rs[0].detail}`
      : `  ${target}: ${rs.length}${noun} — ${rs[0].detail}`);
  }

  // routes and links count the dead route or link; every other check counts the
  // board. Both print the same way, so the unit being counted lives in the label.
  const affected = opts.count === 'items' ? records.length : byTarget.size;
  console.log(`\n${total} ${opts.unit || 'boards'} · ${affected} ${label}`);

  // A run writes its findings down so the next run can tell new from known.
  // Standalone there is nothing to compare against, and nothing is written.
  writeResult({ check, label, total, affected, findings: records });
  return affected;
}

// A check that could not run has not passed. It says why, writes an empty result
// marked skipped, and exits 0 — so a missing word list never reads as a clean run.
export function skip(why, ...how) {
  console.log(`  ${why}`);
  for (const line of how) console.log(`  ${line}`);
  writeResult({ check: basename(process.argv[1] || 'check', '.mjs'), skipped: why, findings: [] });
  process.exit(0);
}

function writeResult(result) {
  const dir = process.env.MD_RUN_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${result.check.replace(/[^a-z0-9]+/gi, '-')}.json`),
    JSON.stringify(result, null, 2) + '\n');
}
