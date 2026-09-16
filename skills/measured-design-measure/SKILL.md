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

## What a harness runs against

Ten of the thirteen need only a URL and a name, so they do not require the rest of the pack. `target`
in `harness.config.json` selects what is being checked: `dir` (a folder of built boards), `urls` (an
explicit route list against a running server), or `crawl` (same-origin, from a start URL). A harness
never learns which — it is handed `{ id, url }` and asks the DOM its one question.

Two checks need more than a DOM, and the difference is a real one rather than a packaging detail:

- `routes` proves a **declared route map binds** — every click route points at text that exists on its
  source board. That is what stops a route map lying to QA, and it needs `model/`. Where there is no
  model, `run-all` substitutes `links`, which only proves nothing 404s. Weaker claim, different name.
- `vocab` needs an authored word list; a policy cannot be inferred from a DOM. It reads
  `model/policy.json`, or a standalone `vocab.policy.json`, and stays quiet when there is neither.

## The anatomy of a harness

Loads the built output in a headless browser, asks the DOM one question, prints a count. Under thirty
lines. The comment at the top explains **why this check exists**, usually by naming the bug that
prompted it. Runnable copies are in `scaffold/harnesses/`.

```js
import { targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  const hits = await p.evaluate(() => { /* one question */ });
  // one finding per hit, with a `key` that names what is wrong and nothing else
  for (const h of hits) found.push({ target: board.id, detail: h.detail, key: `over budget: ${h.name}` });
}
await close();
report('boards over budget', T.length, found);
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

Three of the file manager harnesses exist because a specific bug got through, and each found
something the moment it ran.

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

## Make the number go one way

A harness finds the problem every time. That is only worth something if a run can be compared to the
last one, so `report()` writes each finding down with a fingerprint built from what it is — the check,
the screen, and the thing that is wrong — with volatile numbers normalised out. A contrast ratio
drifting from 3.12 to 3.40 stays one finding rather than reading as one fix and one regression.

```sh
npx measured-design baseline        # freeze today's findings
npx measured-design check --no-new  # fail only on a finding that is not in the baseline
```

This is what makes 158 → 0 achievable rather than aspirational. Nobody stops to fix 158 things, and a
check that fails on all 158 from the first commit gets deleted within the week. A baseline lets the
count stop rising on day one and come down whenever someone is in the file anyway. Findings that leave
the baseline are reported as fixed, and `baseline --update` locks the gain in.

Where a finding is genuinely wrong or genuinely accepted, it is waived with a reason and a date —
never by deleting the check, which throws away the other ninety-two boards it was watching:

```sh
npx measured-design waive <fingerprint> --why "..." --until 2027-01-01
```

That is the same standing rule as everywhere else in this pack: the disagreement is real, and it ends
in a recorded decision rather than in whoever spoke last. An expired waiver brings its finding back.

A check that could not run calls `skip()` and is recorded as skipped, not clean — and `baseline`
refuses to record a run in which any check errored, because a baseline taken from a gap reads as a
clean sweep forever after.

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
- `interaction-design-fitts-law` — the reasoning a target-size threshold has to stand on
- `prototyping-testing-accessibility-test-plan` — the coverage plan behind the accessibility harnesses

Thinking, run alongside:
- `thinking-scientific-method` — the harness is the cheapest discriminating observation
- `thinking-probabilistic` — a count on 93 boards is not a rate; say which population it describes
- `thinking-margin-of-safety` — where the threshold should sit above the failure point
- `thinking-circle-of-competence` — a harness proves only the thing it looks at; state the boundary

## Stop condition

Every property the audit found a problem in has a harness. Every harness prints one number and names
the bug that prompted it. The whole set runs in under a few minutes, and is run before every publish.
Not before.

And the numbers are baselined, so the next commit cannot quietly add to them. A harness nothing
compares against measures the same thing every week and changes nothing.
