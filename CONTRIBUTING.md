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
import { cfg, boards, url, id, open, report } from './lib.mjs';
const { p, close } = await open();
const rows = [];
let affected = 0;
for (const f of boards()) {
  // measure something on the rendered board, push a [id, detail] row when it fails
}
await close();
report(`boards over budget`, boards().length, affected, rows);
```

- Read the config it needs (a budget, a selector, a viewport width) from `cfg`, and add the default to
  `harness.config.json` if it is not already there.
- `report()` is the only thing that prints a summary line — do not add a second one.
- Register the new check in the `checks` array in `run-all.mjs`, in the order you want it to run.
- It **prints**, it does not refuse. The gate has exactly one refusing check
  (`scaffold/gate.py`, an unbound route), and the README explains why a second one is a decision with
  a cost, not a given. Propose a refusing check separately, with the failure mode it prevents.

Open the PR with a board (real or in `examples/demo`) that the harness actually flags, so the number is
not theoretical.

## New adapters

`scaffold/adapters/python/` is the reference generator, not the requirement. An adapter for another
stack is welcome provided it satisfies the same build contract: it reads a scope document, writes the
`model/*.json` files listed in `AGENTS.md`, and the build rationale for each screen comes from the
generator's own source — a docstring or comment extracted at build time — not a separate document.
`scaffold/gate.py` and the harnesses are stack-agnostic; if your adapter produces the same `model/` and
`boards/` shapes, they run against it unchanged.

## Sharper pairings

`PAIRING.md` names which thinking skill each of the six stages should run alongside, argued from one
project (Swarm Desktop). If a pairing does not hold up on a different kind of product, open an issue
with the stage, the pairing that didn't fit, and what you used instead. This is the part of the pack
most likely to be wrong in a way only a second project would surface.

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
