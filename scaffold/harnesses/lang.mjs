// Screen-reader language announcement. Without `<html lang>`, assistive tech
// falls back to its default voice and pronunciation rules for the whole board —
// wrong for every language that is not that default.
import { boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  await p.goto(url(f));
  const lang = await p.evaluate(() => document.documentElement.lang);
  if (!lang) { affected++; rows.push([id(f), 'no <html lang> — a screen reader has to guess']); }
}
await close();
report('boards with no html lang', boards().length, affected, rows);
