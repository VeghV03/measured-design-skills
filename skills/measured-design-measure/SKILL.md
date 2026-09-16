---
name: measured-design-measure
description: Stage 05 of measured-design. Turn each audit finding into a harness that loads the built output, asks the DOM one question and prints a count — overflow, contrast, translucency, cell fit, structure, vocabulary, routes, density, offline. Use when a bug escapes, when a design needs to stay good rather than be good once, or when asked to prove a claim about a set of screens.
---
# 05 · Measure — and make the measurement permanent

**Output:** a harness per property, each printing one number.

An audit finds a problem once. A harness finds it **every time**, including the time nobody was
looking. That is the difference between a design that was good and a design that stays good.

> 158 → 0 jargon words outside Advanced. 42 → 0 screens with no heading. 22 → 0 routes pointing at
> nothing. 14 → 0 chips painting over a column. Every one was invisible until something counted it.
> None would have come up in a review.

## The anatomy of a harness

Loads the built output in a headless browser, asks the DOM one question, prints a count. Under thirty
lines. The comment at the top explains **why this check exists**, usually by naming the bug that
prompted it. Runnable copies are in `scaffold/harnesses/`.

```js
import { chromium } from 'playwright';
import { readdirSync } from 'fs';
const files = readdirSync('.').filter(f => f.endsWith('.html'));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let bad = [];
for (const f of files) {
  await p.goto('file://' + dir + f);
  const hits = await p.evaluate(() => { /* one question */ });
  if (hits.length) bad.push([f, hits]);
}
console.log(`${files.length} boards · ${bad.length} affected`);
await b.close();
```

## The catalogue worth building for any product

| Check | Question it asks |
|---|---|
| overflow | does any content fall off the frame, at each supported width |
| contrast | every text node against its **actual composited** background, in both themes |
| translucency | does any semi-transparent layer dim text below 4.5:1 |
| cell fit | is any element wider than the grid cell containing it |
| structure | heading present · controls labelled · status never colour-only · line measure |
| vocabulary | forbidden words outside their permitted zone, per `policy.json` |
| routes | does every declared link point at text that exists on the board |
| density | element count per screen, at the real data scale |
| offline | does the deliverable open with the network refused |

## Write the harness for the bug you just found

Three Swarm Desktop harnesses exist because a specific bug got through, and each found something the
moment it ran.

- **The route gate.** Written after 22 of 162 declared routes turned out to point at buttons deleted
  months earlier. On its first run it caught a third duplicate dictionary key.
- **The translucency check.** A veil over a list measured fine to the contrast harness, which reads
  *declared* colours. Composited, a white veil at 34% takes muted text from 4.74:1 down to 2.53:1.
  There is no opacity that both reads as a veil and keeps text legible, so the veil was deleted.
- **The cell-fit check.** A status chip was 137px in a 132px cell, painting over the next column on
  14 screens. The overflow harness never saw it, because overflowing a grid cell never crosses the
  edge of the frame.

When a bug escapes, ask which harness *should* have caught it and why it structurally could not. That
answer is the next harness.

## Make the build refuse

The strongest checks do not report — they stop the build. A route map that lies to QA is worse than a
missing one, so the gate will not produce a prototype if any declared route fails to bind. Everything
else prints a number and lets a person decide. Adding a second refusing check is a decision with a
cost: every future contributor now has to satisfy it before they can look at anything.

## Skills to invoke

Design:
- `design-systems-accessibility-audit` — WCAG with severity and remediation, on a real build
- `adaptive-interfaces-responsive-review` — behaviour across the supported widths
- `prototyping-testing-heuristic-evaluation` — expert review with severity ratings
- `design-ops-design-qa-checklist` — turning findings into a repeatable gate
- `interaction-design-doherty-threshold` — response budgets, and what a wait shows past them

Thinking, run alongside:
- `thinking-scientific-method` — the harness is the cheapest discriminating observation
- `thinking-probabilistic` — a count on 93 boards is not a rate; say which population it describes
- `thinking-margin-of-safety` — where the threshold should sit above the failure point
- `thinking-circle-of-competence` — a harness proves only the thing it looks at; state the boundary

## Stop condition

Every property the audit found a problem in has a harness. Every harness prints one number and names
the bug that prompted it. The whole set runs in under a few minutes, and is run before every publish.
Not before.
