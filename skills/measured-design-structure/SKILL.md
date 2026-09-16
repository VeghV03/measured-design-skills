---
name: measured-design-structure
description: Stage 02 of measured-design. Model the product in two layers that disagree on purpose — journeys copied verbatim from the scope document, and a product IA classifying every screen as place, state, detour or entrance — then record what nothing serves. Use when deciding what the structure is, or when screens exist but nobody can say what kind of thing each one is.
---
# 02 · Model the structure, in two layers that disagree on purpose

**Output:** `model/journeys.json`, `model/screens.json`, `model/gaps.json`.

Most projects model one structure and suffer for it. You need two, and the tension between them is
informative.

## Layer one — journeys: what happens in what order

Sequence, preconditions, consequences. This is what QA walks and what engineering sequences work by.

If a scope document already defines journeys, **copy them verbatim.** Never paraphrase. A developer
holding both documents must never have to build the mapping in their head. Copy the step names
character for character, including the ones you think are badly worded — rename later, deliberately,
through `measured-design-drift`.

## Layer two — product IA: what kind of thing each screen is

Orthogonal to sequence. Every screen is exactly one of four kinds, and the classification is a design
constraint, not a label. The definitions and their obligations are in `measured-design-contract`.

The second layer earns its keep by making gaps countable.

> File manager: classifying all 93 screens showed four places with exactly one state, and seven with
> no empty state at all. An empty place is the most common screen any of them will ever show — every
> account starts there — and it was the one nobody had drawn. Seven teams would have invented seven
> different answers to the same three questions. They now come from one shared component.

## Record what nothing serves

Keep a gap list keyed to steps, not floating free. "Not on my list" and "the agreed scope asks for
this and nothing serves it" are different claims, and only the second is useful. Write gaps into
`model/gaps.json` against the step id, so the viewer can show them beside the step they belong to.

## Model the interactions that have no button

Every screen reachable by clicking a label is the easy half. People drag files in and right-click
rows, and if the model is silent, each engineer invents an answer. Record these as `via: "gesture"`
routes — see `measured-design-contract`. They can never have an arrow drawn from a clickable label,
so without the distinction they read as unreachable and get deleted.

> File manager: the right-click menu alone was the home of six actions that had screens already and
> no drawn way in.

## Skills to invoke

Design:
- `ux-strategy-information-architecture` — the place / state / detour / entrance model
- `design-research-journey-map` — sequence with preconditions and consequences
- `prototyping-testing-user-flow-diagram` — what precedes what, drawn so QA can walk it
- `interaction-design-state-machine` — states, events, guards; where an edge case hides
- `interaction-design-navigation-patterns` — turning places into a rail that survives growth
- `interaction-design-hicks-law` — how many choices one place can offer before it stops being a place
- `interaction-design-teslers-law` — complexity that cannot be removed, only moved; decide who absorbs it
- `design-research-card-sort-analysis` — when the IA should come from evidence rather than argument
- `ux-strategy-experience-map` — the parts of the experience that happen outside your product

Thinking, run alongside:
- `thinking-systems` — where the boundary is, and which loops the structure creates
- `thinking-second-order` — what this classification forces elsewhere
- `thinking-via-negativa` — the gap list is the removal: what is absent that the scope asks for
- `thinking-map-territory` — the IA is a model, not the product; name where it lies

## Stop condition

Every screen has a kind and, if it is a `state`, a parent that is a `place`. Every step in
`journeys.json` either names screens or appears in `gaps.json`. Every screen has at least one inbound
route of some `via`. Not before.
