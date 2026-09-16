#!/usr/bin/env node
// The first minute. `init` writes a config for the project you already have and
// runs the checks that need nothing but a DOM — a real number about your own code
// before you have adopted anything. The contract, the gate and the route map are
// still there; they are just no longer the price of entry.
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const here = new URL('.', import.meta.url).pathname;
const harnesses = resolve(here, '../scaffold/harnesses');
const CONFIG = 'measured-design.config.json';

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
  return run();
}

const [cmd] = process.argv.slice(2);
const dir = process.cwd();
if (cmd === 'init') process.exitCode = await init(dir);
else if (cmd === 'check') {
  if (!existsSync(join(dir, CONFIG)))
    console.log(`\n  No ${CONFIG} here. Run \`npx measured-design init\` first.\n`), process.exitCode = 2;
  else process.exitCode = run(process.argv.slice(3));
} else {
  console.log(`
  measured-design — checks that print a number about screens you already have.

    npx measured-design init     detect this project, write ${CONFIG}, run the checks
    npx measured-design check    run them again

  Ten of the thirteen checks need only a URL. Two need more: route binding needs a
  declared route map, and the vocabulary check needs a word list. Both say so.
`);
  process.exitCode = cmd ? 1 : 0;
}
