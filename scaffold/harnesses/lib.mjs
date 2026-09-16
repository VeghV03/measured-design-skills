// Shared plumbing so each check stays under thirty lines and says one thing.
// Config comes from harness.config.json beside this file, or the defaults below.
import { chromium } from 'playwright';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const here = new URL('.', import.meta.url).pathname;
const cfgPath = join(here, 'harness.config.json');
export const cfg = Object.assign({
  boards: '../../boards',
  model: '../../model',
  widths: [1440, 1024, 768],
  height: 900,
  executablePath: null,
  scrimSelector: '.scrim',
  cellChildSelector: '.chip',
  densityBudget: 400
}, existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {});

export const boardsDir = resolve(here, cfg.boards);
export const modelDir = resolve(here, cfg.model);
export const boards = () => readdirSync(boardsDir).filter(f => f.endsWith('.html')).sort();
export const model = n => JSON.parse(readFileSync(join(modelDir, n), 'utf8'));
export const url = f => 'file://' + join(boardsDir, f);
export const id = f => f.replace(/\.html$/, '');

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
