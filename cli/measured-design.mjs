#!/usr/bin/env node
// The first minute. `init` writes a config for the project you already have and
// runs the checks that need nothing but a DOM — a real number about your own code
// before you have adopted anything. The contract, the gate and the route map are
// still there; they are just no longer the price of entry.
//
// The second day is `baseline` and `check --no-new`. A number you saw once is a
// fact about a Tuesday. A number that cannot go up is a property of the product.
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { BASELINE, WAIVERS, loadBaseline, writeBaseline, loadWaivers, addWaiver, compare } from './ratchet.mjs';

const here = new URL('.', import.meta.url).pathname;
const harnesses = resolve(here, '../scaffold/harnesses');
const CONFIG = 'measured-design.config.json';
const FINDINGS = join('.measured-design', 'findings.json');

// Framework → the port its dev server uses, and where a static build lands.
// Only used to guess a default; anything wrong here is one line to fix in the config.
const KNOWN = [
  ['next', 3000, null], ['nuxt', 3000, '.output/public'], ['@remix-run/dev', 3000, 'build/client'],
  ['@sveltejs/kit', 5173, 'build'], ['astro', 4321, 'dist'], ['vite', 5173, 'dist'],
  ['react-scripts', 3000, 'build'], ['@angular/cli', 4200, 'dist'],
];

function detect(dir) {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return { name: null, port: 3000, out: null };
  let pkg = {};
  try { pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch { return { name: null, port: 3000, out: null }; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, port, out] of KNOWN)
    if (deps[name]) return { name, port, out: out && existsSync(join(dir, out)) ? out : out };
  return { name: null, port: 3000, out: null };
}

async function reachable(url) {
  try {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), 1500);
    const r = await fetch(url, { signal: c.signal });
    clearTimeout(timer);
    return r.ok;
  } catch { return false; }
}

function run(args = []) {
  try { execFileSync('node', [join(harnesses, 'run-all.mjs'), ...args], { stdio: 'inherit' }); return 0; }
  catch (e) { return e.status ?? 1; }
}

function runFindings(dir) {
  const p = join(dir, FINDINGS);
  if (!existsSync(p)) {
    console.log(`\n  The run wrote no findings file. Nothing to compare.\n`);
    return null;
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}

function needConfig(dir) {
  if (existsSync(join(dir, CONFIG))) return true;
  console.log(`\n  No ${CONFIG} here. Run \`npx measured-design init\` first.\n`);
  return false;
}

async function init(dir) {
  if (existsSync(join(dir, CONFIG))) {
    console.log(`\n  ${CONFIG} already exists — leaving it alone. Run \`measured-design check\`.\n`);
    return 0;
  }
  const d = detect(dir);
  const start = `http://localhost:${d.port}`;
  console.log(`\n  ${d.name ? `Detected ${d.name}.` : 'No known framework in package.json.'}`);

  let target;
  if (await reachable(start)) {
    console.log(`  Dev server answering on ${start} — crawling it.`);
    target = { mode: 'crawl', start, limit: 50 };
  } else if (d.out && existsSync(join(dir, d.out))) {
    console.log(`  No server on ${start}; using the build in ${d.out}/.`);
    target = { mode: 'dir', dir: `./${d.out}` };
  } else {
    console.log(`  No server on ${start} and no build output found.`);
    target = { mode: 'crawl', start, limit: 50 };
  }

  const cfg = { target, widths: [1440, 1024, 768], height: 900, densityBudget: 400, targetSize: 24 };
  writeFileSync(join(dir, CONFIG), JSON.stringify(cfg, null, 2) + '\n');
  console.log(`  Wrote ${CONFIG}.`);

  if (target.mode === 'crawl' && !(await reachable(start))) {
    console.log(`\n  Start your dev server, then: npx measured-design check\n`);
    return 0;
  }
  console.log('');
  const code = run();
  const found = runFindings(dir);
  if (found && found.findings.length)
    console.log(`\n  ${found.findings.length} findings. Freeze them so they cannot grow:\n    npx measured-design baseline\n`);
  return code;
}

// Every finding carries its fingerprint, because the next thing a person wants to
// do with a finding they disagree with is waive it, and that needs a name for it.
function list(title, items, limit = 10) {
  if (!items.length) return;
  console.log(`\n  ${title}`);
  for (const f of items.slice(0, limit))
    console.log(`    ${f.fingerprint}  ${f.check} · ${f.target}: ${f.detail}`);
  if (items.length > limit) console.log(`    … and ${items.length - limit} more`);
}

function ratchet(dir, { strict }) {
  const found = runFindings(dir);
  if (!found) return 2;
  const baseline = loadBaseline(dir);
  if (!baseline) {
    console.log(`\n── ratchet`);
    console.log(`\n  No ${BASELINE}. Record today's ${found.findings.length} so the next run can`);
    console.log(`  fail on ${found.findings.length + 1} rather than on all ${found.findings.length}:\n`);
    console.log(`    npx measured-design baseline\n`);
    return strict ? 2 : 0;
  }
  const waivers = loadWaivers(dir);
  const c = compare(found, baseline, waivers);

  console.log(`\n── ratchet`);
  list('new since the baseline', c.fresh);
  list('fixed since the baseline', c.fixed);
  console.log(`\n${c.baselined} baselined · ${c.fresh.length} new · ${c.fixed.length} fixed · ${c.waived.length} waived`);

  for (const w of waivers.expired)
    console.log(`\n  waiver expired ${w.until} — ${w.fingerprint}: ${w.why}`);
  for (const w of waivers.malformed)
    console.log(`\n  waiver ignored, no "why" — ${w.fingerprint || '(no fingerprint)'}`);
  for (const w of waivers.forever)
    console.log(`\n  waiver has no "until" — ${w.fingerprint}: ${w.why}`);
  for (const w of c.stale)
    console.log(`\n  waiver no longer matches anything, delete it — ${w.fingerprint}: ${w.why}`);
  if (found.errored.length)
    console.log(`\n  measured nothing (the check errored): ${found.errored.join(', ')}`);

  if (c.fixed.length && !c.fresh.length)
    console.log(`\n  ${c.fixed.length} gone. Lock it in so they cannot come back:\n    npx measured-design baseline --update\n`);
  else if (c.fresh.length)
    console.log(`\n  ${c.fresh.length} new. Fix it, or record the decision:\n    npx measured-design waive <fingerprint> --why "..." --until 2027-01-01\n`);
  else console.log('');

  return strict && c.fresh.length ? 1 : 0;
}

function baseline(dir, { update }) {
  const found = runFindings(dir);
  if (!found) return 2;
  if (found.errored.length) {
    console.log(`\n  Not recording a baseline: ${found.errored.join(', ')} errored and measured nothing.`);
    console.log(`  A baseline written now would record those checks as clean.\n`);
    return 2;
  }
  if (loadBaseline(dir) && !update) {
    console.log(`\n  ${BASELINE} already exists. Overwriting it accepts every finding in this run,`);
    console.log(`  including any that are new. If that is what you mean:\n`);
    console.log(`    npx measured-design baseline --update\n`);
    return 2;
  }
  const n = writeBaseline(dir, found);
  console.log(`\n  Recorded ${n} findings in ${BASELINE}.`);
  // Not "fails above ${n}": the ratchet compares fingerprints, not totals. Fixing
  // one finding and introducing another keeps the count identical and still fails,
  // which is the whole point of identifying a finding by what it is.
  console.log(`  From here, \`npx measured-design check --no-new\` fails on any finding that is`);
  console.log(`  not one of these ${n} — including a new one that arrives as another is fixed.\n`);
  return 0;
}

function waive(dir, argv) {
  const [fp] = argv;
  const flag = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
  const why = flag('--why'), until = flag('--until');
  if (!fp || fp.startsWith('--') || !why) {
    console.log(`\n  Usage: npx measured-design waive <fingerprint> --why "..." [--until YYYY-MM-DD]`);
    console.log(`\n  A waiver without a reason is an opinion that won. --why is required.`);
    console.log(`  Fingerprints are printed beside every finding by \`check --no-new\`.\n`);
    return 2;
  }
  if (until && Number.isNaN(Date.parse(until))) {
    console.log(`\n  --until ${until} is not a date I can read. Use YYYY-MM-DD.\n`);
    return 2;
  }
  addWaiver(dir, { fingerprint: fp, why, ...(until ? { until } : {}) });
  console.log(`\n  Waived ${fp} in ${WAIVERS}${until ? ` until ${until}` : ' with no expiry'}.`);
  if (!until) console.log(`  No expiry means every run will keep mentioning it. Prefer --until.`);
  console.log('');
  return 0;
}

const argv = process.argv.slice(2);
const [cmd] = argv;
const dir = process.cwd();

if (cmd === 'init') process.exitCode = await init(dir);
else if (cmd === 'check') {
  if (!needConfig(dir)) process.exitCode = 2;
  else {
    const strict = argv.includes('--no-new');
    const code = run(argv.slice(1).filter(a => a !== '--no-new'));
    const verdict = existsSync(join(dir, BASELINE)) || strict ? ratchet(dir, { strict }) : 0;
    process.exitCode = code || verdict;
  }
} else if (cmd === 'baseline') {
  if (!needConfig(dir)) process.exitCode = 2;
  else {
    // The run's exit code is deliberately not short-circuited here. A crashed
    // harness is exactly when a person most needs to be told why no baseline was
    // written, and `code || baseline(...)` would skip the sentence that says so.
    run(argv.slice(1).filter(a => a !== '--update'));
    process.exitCode = baseline(dir, { update: argv.includes('--update') });
  }
} else if (cmd === 'waive') process.exitCode = waive(dir, argv.slice(1));
else {
  console.log(`
  measured-design — checks that print a number about screens you already have.

    npx measured-design init                  detect this project, write ${CONFIG}, run the checks
    npx measured-design check                 run them again
    npx measured-design baseline              freeze today's findings so they cannot grow
    npx measured-design check --no-new        fail only on a finding that is not in the baseline
    npx measured-design waive <fp> --why "…"  record a decision to accept one finding

  Ten of the thirteen checks need only a URL. Two need more: route binding needs a
  declared route map, and the vocabulary check needs a word list. Both say so.

  Nobody fixes 158 things. \`baseline\` freezes the 158; \`--no-new\` stops the 159th.
`);
  process.exitCode = cmd ? 1 : 0;
}
