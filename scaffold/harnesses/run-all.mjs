// Run every check and print one line each. Under two minutes on a set of a
// hundred boards, and it has never once been a waste. Run before every publish.
import { execFileSync } from 'child_process';
const checks = ['overflow', 'contrast light', 'contrast dark', 'translucency',
  'cellfit', 'structure', 'vocab', 'routes', 'density', 'lang', 'target-size', 'motion'];
let failed = 0;
for (const c of checks) {
  const [file, ...args] = c.split(' ');
  process.stdout.write(`\n── ${c}\n`);
  try { execFileSync('node', [`${file}.mjs`, ...args], { stdio: 'inherit' }); }
  catch { failed++; process.stdout.write(`   ${c} errored\n`); }
}
console.log(`\n${checks.length} checks · ${failed} errored`);
// A harness printing a finding is not a failure — a person decides what to do with
// a number. A harness crashing is: it measured nothing, and silently exiting 0
// here would let CI go green on that.
process.exitCode = failed ? 1 : 0;
