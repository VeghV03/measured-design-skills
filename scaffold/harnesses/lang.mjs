// Screen-reader language announcement. Without `<html lang>`, assistive tech
// falls back to its default voice and pronunciation rules for the whole board —
// wrong for every language that is not that default.
import { targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  const lang = await p.evaluate(() => document.documentElement.lang);
  if (!lang) found.push({ target: board.id, detail: 'no <html lang> — a screen reader has to guess' });
}
await close();
report('boards with no html lang', T.length, found);
