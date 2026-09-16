// Does the deliverable open with the network refused. An artifact that pulls a
// library from a CDN is useless on a plane and in five years. Run it against the
// viewer output as well as the boards.
import { targets, open, report } from './lib.mjs';
const T = await targets();
const target = process.argv[2];
const { p, close } = await open();
await p.route('**', r => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
const rows = [];
let affected = 0;
const list = target ? [{ id: target, url: 'file://' + target }] : T;
for (const board of list) {
  const blocked = [];
  p.on('requestfailed', r => blocked.push(r.url()));
  await p.goto(board.url);
  const painted = await p.evaluate(() => document.body && document.body.innerText.trim().length > 0);
  if (blocked.length || !painted) { affected++; rows.push([board.id, blocked.length ? `${blocked.length} external requests` : 'rendered empty']); }
}
await close();
report('files that do not open with the network refused', list.length, affected, rows);
