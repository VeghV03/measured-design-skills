// Does the deliverable open with the network refused. An artifact that pulls a
// library from a CDN is useless on a plane and in five years. Run it against the
// viewer output as well as the boards.
import { boards, url, id, open, report } from './lib.mjs';
const target = process.argv[2];
const { p, close } = await open();
await p.route('**', r => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
const rows = [];
let affected = 0;
const list = target ? [target] : boards();
for (const f of list) {
  const blocked = [];
  p.on('requestfailed', r => blocked.push(r.url()));
  await p.goto(target ? 'file://' + target : url(f));
  const painted = await p.evaluate(() => document.body && document.body.innerText.trim().length > 0);
  if (blocked.length || !painted) { affected++; rows.push([id(f), blocked.length ? `${blocked.length} external requests` : 'rendered empty']); }
}
await close();
report('files that do not open with the network refused', list.length, affected, rows);
