// Shared plumbing so each check stays under thirty lines and says one thing.
//
// Config is found in the project first (measured-design.config.json beside the
// thing being checked), then beside this file. Relative paths resolve against
// whichever config was found, not against this directory — otherwise a pack
// installed under node_modules resolves every path into itself.
import { chromium } from 'playwright';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';

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
  const seen = new Set(), out = [], queue = [t.start];
  while (queue.length && out.length < limit) {
    const u = queue.shift().split('#')[0];
    if (seen.has(u)) continue;
    seen.add(u);
    let res = null;
    try { res = await p.goto(u, { waitUntil: 'domcontentloaded' }); } catch { continue; }
    if (!res || res.status() >= 400) continue;
    out.push({ id: idFromUrl(u), url: u });
    for (const l of await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href)))
      if (l.startsWith(origin)) queue.push(l);
  }
  await b.close();
  return out;
}

// What is being checked: a folder of built boards, an explicit route list, or a
// crawl. Ten of the thirteen checks never need to know which — they take a url and
// a name. The two that read model/ are the two that cannot run without it.
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
    cached = readdirSync(d).filter(f => f.endsWith('.html')).sort()
      .map(f => ({ id: f.replace(/\.html$/, ''), url: 'file://' + join(d, f) }));
  }
  return cached;
}

export async function open(width = cfg.widths[0]) {
  const b = await chromium.launch(cfg.executablePath ? { executablePath: cfg.executablePath } : {});
  const p = await b.newPage({ viewport: { width, height: cfg.height } });
  return { b, p, close: () => b.close() };
}

// One number, one line, every time. Nothing else prints a summary.
export function report(label, total, affected, rows = []) {
  for (const [board, detail] of rows) console.log(`  ${board}: ${detail}`);
  console.log(`\n${total} boards · ${affected} ${label}`);
  return affected;
}
