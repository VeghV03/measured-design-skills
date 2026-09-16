---
name: measured-design-ship
description: Stage 06 of measured-design. Ship one navigable artifact that answers five questions about any screen without asking a designer, with a happy-path switch, a failure register, visible gates on unagreed claims, and an offline copy. Use when handing over to engineering, or when a folder of screens needs to become a document.
---
# 06 · Ship it as a document engineering can hold

**Output:** one navigable artifact, and a sync discipline.

A folder of PNGs is not a handoff. What engineering and QA need is one artifact that answers five
questions about any screen without asking a designer.

| Question | Answered by |
|---|---|
| What kind of thing is this? | the product view — place, state, detour or entrance, with its parent |
| Where does it sit in the agreed scope? | the journey and step, named exactly as the scope document names them |
| Why is it like this? | the rationale, extracted from the generator |
| What leads here and what leads away? | the route map — and it is true, because the build refuses otherwise |
| What is it made of? | the component inventory, derived from the markup rather than typed |

`scaffold/viewer/build_viewer.py` produces this from `model/index.json`. It emits a single
self-contained HTML file with no external libraries, which is why there is no separate offline build
to go stale.

## Two features worth building into the viewer

**A happy-path switch.** A reader walking the design for the first time wants the path that works; a
reader building it wants every state. Mixed into one list, neither is readable.

**A failure register with a written rule.** The rule is in `measured-design-contract`. Record the
clause, not just the flag — a register you cannot argue with is a register nobody trusts.

## Keep the sources of truth level

Where a scope document and a prototype both exist, they drift, and drift is silent. Two defences:
copy structure verbatim so names mean one thing, and **flag every claim the prototype makes that the
scope document has not yet seen** — visibly, on the screen that makes it, so nobody mistakes a
proposal for an agreement. `measured-design-drift` produces that list.

Where the two disagree, the audited prototype dictates. The scope document is brought level with it,
not the other way round — otherwise every audit finding is optional.

## Make the deliverable survive the CDN

An artifact that pulls a library from a CDN is useless on a plane and in five years. The reference
viewer has no dependencies at all. If you replace it with one that has them, inline them and script
the inlining — a hand-made offline copy goes stale the moment the prototype changes.

## Skills to invoke

Design:
- `design-ops-handoff-spec` — specs, measurements, assets, states, QA checklist
- `design-systems-documentation-template` — a shape a reader can navigate
- `designer-toolkit-design-rationale` — decision records that survive the author leaving
- `cross-functional-alignment-decision-log` — what was settled, when, and on what evidence

Thinking, run alongside:
- `thinking-opportunity-cost` — what the handover format stops you doing later
- `thinking-reversibility` — which named things are now expensive to rename
- `thinking-map-territory` — the prototype is a claim about the product, not the product

## Stop condition

One artifact opens from disk with the network refused and answers all five questions for every
screen. Every unagreed claim is flagged on the screen that makes it. Ids, not just labels, match the
scope document. Not before.
