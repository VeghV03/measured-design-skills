// Run every check and print one line each. Under two minutes on a set of a
// hundred boards, and it has never once been a waste. Run before every publish.
//
// The run also writes what it found. A number on a terminal tells you where you
// are; a number written down is the only way to tell whether you are moving.
import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { hasModel } from './lib.mjs';

// Resolve the checks against this file, not the working directory — the CLI runs
// them from inside somebody else's project.
const here = new URL('.', import.meta.url).pathname;

const argv = process.argv.slice(2);
const flag = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
const out = flag('--json') || join(process.cwd(), '.measured-design', 'findings.json');
const runDir = join(dirname(resolve(out)), 'run');

// routes.mjs proves a declared route map binds; links.mjs only proves nothing
// 404s. Run the stronger one whenever there is a model to run it against.
const binding = hasModel('routes.json') && hasModel('screens.json') ? 'routes' : 'links';
const checks = ['overflow', 'contrast light', 'contrast dark', 'translucency',
  'cellfit', 'structure', 'vocab', binding, 'density', 'lang', 'target-size', 'motion'];

rmSync(runDir, { recursive: true, force: true });
mkdirSync(runDir, { recursive: true });

const crashed = [];
for (const c of checks) {
  const [file, ...args] = c.split(' ');
  process.stdout.write(`\n── ${c}\n`);
  try {
    execFileSync('node', [join(here, `${file}.mjs`), ...args],
      { stdio: 'inherit', env: { ...process.env, MD_RUN_DIR: runDir } });
  } catch { crashed.push(c.replace(' ', '-')); process.stdout.write(`   ${c} errored\n`); }
}

// One file for the whole run. A check that errored is named here rather than
// silently counted as clean — two ways, because they are two different faults.
// A check that wrote no result measured nothing. A check that wrote one and then
// crashed measured something, but not necessarily all of it; a baseline taken
// from either would record a gap as a clean sweep.
const results = readdirSync(runDir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(join(runDir, f), 'utf8')));
const ran = new Set(results.map(r => r.check));
const findings = results.flatMap(r => r.findings);
const errored = [...new Set([...crashed,
  ...checks.map(c => c.replace(' ', '-')).filter(c => !ran.has(c))])];
const failed = errored.length;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(resolve(out), JSON.stringify({
  version: 1,
  ranAt: new Date().toISOString(),
  checks: results.map(({ check, label, total, affected, skipped }) =>
    ({ check, label, total, affected, skipped })),
  errored,
  findings,
}, null, 2) + '\n');
rmSync(runDir, { recursive: true, force: true });

const skipped = results.filter(r => r.skipped).length;
console.log(`\n${checks.length} checks · ${failed} errored${skipped ? ` · ${skipped} skipped` : ''}`);
console.log(`${findings.length} findings · wrote ${resolve(out)}`);
// A harness printing a finding is not a failure — a person decides what to do with
// a number. A harness crashing is: it measured nothing, and silently exiting 0
// here would let CI go green on that.
process.exitCode = failed ? 1 : 0;
