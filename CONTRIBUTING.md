# Contributing

The pack is deliberately small at its core — ten skills, one contract, one refusing gate. The standing
rule for anything added to it is the same one the procedure applies to a design: something that prints
a number beats something that adds a meeting. Keep that in mind and most decisions about a PR make
themselves.

## Before you open anything

Read `AGENTS.md` for the layout and `skills/measured-design-contract/SKILL.md` for what a screen,
route, and rationale entry are actually required to be. Most rejected PRs would not have been if this
had been read first — the contract is short on purpose.

## New harnesses

A harness is a file under thirty lines in `scaffold/harnesses/` that measures one property and prints
one number. Look at `density.mjs` for the shape:

```js
import { cfg, targets, open, report } from './lib.mjs';
const T = await targets();
const { p, close } = await open();
const found = [];
for (const board of T) {
  await p.goto(board.url);
  // measure one thing, and push one finding per hit
  found.push({ target: board.id, detail: `${n} elements, budget ${cfg.densityBudget}`, key: 'over budget' });
}
await close();
report('boards over budget', T.length, found);
```

- Read the config it needs (a budget, a selector, a viewport width) from `cfg`, and add the default to
  `harness.config.json` if it is not already there.
- `report()` is the only thing that prints a summary line — do not add a second one.
- **One finding per hit, not one per board.** Three failures on one screen are three things a person
  can fix, waive or regress independently. `report()` groups them back together for printing, so the
  output still reads as one line per board.
- **Give the finding a stable `key`.** It is what the fingerprint is built from, and the fingerprint is
  what lets a baseline tell a known finding from a new one. `detail` is for a person to read and may
  carry a measurement that moves; `key` should name the thing that is wrong and nothing else. Digits
  are normalised out of both, so a ratio drifting from 3.12 to 3.40 stays one finding. Omit `key` and
  `detail` is used instead — fine when the detail is already invariant, wrong when it embeds a value
  that is not a number. Anything that changes between two runs of an unchanged board does not belong
  in the identity: a fingerprint that rotates on its own reports a fix and a regression on a quiet day,
  and a baseline that noisy gets deleted within the week.
- If the check counts something other than boards — a dead route, a dead link — pass `{ count: 'items' }`
  and name the unit in the label.
- If the check cannot run, call `skip(why, ...how)` rather than returning a clean zero. A check that
  measured nothing has not passed, and `baseline` refuses to record a run where one errored.
- Register the new check in the `checks` array in `run-all.mjs`, in the order you want it to run.
- It **prints**, it does not refuse. The gate has exactly one refusing check
  (`scaffold/gate.py`, an unbound route), and the README explains why a second one is a decision with
  a cost, not a given. Propose a refusing check separately, with the failure mode it prevents.

Open the PR with a board (real or in `examples/demo`) that the harness actually flags, so the number is
not theoretical.

## New adapters

`scaffold/adapters/python/` is the reference generator, not the requirement — see
`scaffold/adapters/node/` for a second one, built specifically to prove that claim rather than assert
it. An adapter for another stack is welcome provided it satisfies the same build contract: it reads a
scope document, writes the `model/*.json` files listed in `AGENTS.md`, and the build rationale for
each screen comes from the generator's own source — a docstring, or a comment extracted at build time
the way the Node adapter does it — not a separate document. `scaffold/gate.py` and the harnesses are
stack-agnostic; if your adapter produces the same `model/` and `boards/` shapes, they run against it
unchanged. Prove it the way the Node adapter's README does: build the same demo with both adapters and
diff `rationale.json`.

## Sharper pairings

`PAIRING.md` names which thinking skill each of the six stages should run alongside, argued from one
project (the file manager redesign in `examples/source-procedure/`). If a pairing does not hold up on
a different kind of product, open an issue with the stage, the pairing that didn't fit, and what you
used instead. This is the part of the pack most likely to be wrong in a way only a second project
would surface.

## Bug reports

"This refused when it should not have" or "this should have refused and did not" is the most useful
kind of report here, and it is only actionable with the input that produced it. Attach the
`routes.json` / `screens.json` (trimmed to the minimum that reproduces it) and the exact command you
ran. The bug report template asks for this directly.

## What does not need a PR

Wording changes to a `SKILL.md` that do not change what the skill instructs, or cosmetic changes to
the viewer's CSS, are fine as small PRs but do not need an issue first. Anything that changes what the
gate refuses, what a harness measures, or the shape of `model/*.json` should start as an issue so the
trade-off gets discussed before the diff does.
