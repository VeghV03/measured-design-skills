// Run every check and print one line each. Under two minutes on a set of a
// hundred boards, and it has never once been a waste. Run before every publish.
import { execFileSync } from 'child_process';
import { join } from 'path';
import { hasModel } from './lib.mjs';

// Resolve the checks against this file, not the working directory — the CLI runs
// them from inside somebody else's project.
const here = new URL('.', import.meta.url).pathname;

// routes.mjs proves a declared route map binds; links.mjs only proves nothing
// 404s. Run the stronger one whenever there is a model to run it against.
const binding = hasModel('routes.json') && hasModel('screens.json') ? 'routes' : 'links';
const checks = ['overflow', 'contrast light', 'contrast dark', 'translucency',
  'cellfit', 'structure', 'vocab', binding, 'density', 'lang', 'target-size', 'motion'];
let failed = 0;
for (const c of checks) {
  const [file, ...args] = c.split(' ');
  process.stdout.write(`\n── ${c}\n`);
  try { execFileSync('node', [join(here, `${file}.mjs`), ...args], { stdio: 'inherit' }); }
  catch { failed++; process.stdout.write(`   ${c} errored\n`); }
}
console.log(`\n${checks.length} checks · ${failed} errored`);
// A harness printing a finding is not a failure — a person decides what to do with
// a number. A harness crashing is: it measured nothing, and silently exiting 0
// here would let CI go green on that.
process.exitCode = failed ? 1 : 0;
