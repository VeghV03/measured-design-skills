// Run every check and print one line each. Under two minutes on a set of a
// hundred boards, and it has never once been a waste. Run before every publish.
import { execFileSync } from 'child_process';
const checks = ['overflow', 'contrast light', 'contrast dark', 'translucency',
  'cellfit', 'structure', 'vocab', 'routes', 'density'];
let failed = 0;
for (const c of checks) {
  const [file, ...args] = c.split(' ');
  process.stdout.write(`\n── ${c}\n`);
  try { execFileSync('node', [`${file}.mjs`, ...args], { stdio: 'inherit' }); }
  catch { failed++; process.stdout.write(`   ${c} errored\n`); }
}
console.log(`\n${checks.length} checks · ${failed} errored`);
