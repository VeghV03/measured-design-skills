---
description: Run the whole measured-design procedure — frame, structure, generate, audit, measure, ship — on a product or feature area.
argument-hint: "[product or feature, and where the scope document is]"
---
# /prove
Take a product from an agreed scope document to a measured, engineering-ready prototype.

## Steps
1. Read `measured-design-contract`. Everything below writes into `model/`.
2. **Frame** — `measured-design-frame`. Audience with a frequency, one worst outcome, `policy.json`.
3. **Structure** — `measured-design-structure`. Journeys verbatim, IA kinds, gaps.
4. **Generate** — `measured-design-generate`. Design system in code, one function per screen.
5. **Audit** — `measured-design-audit`. The whole stack at once, not one lens at a time.
6. **Measure** — `measured-design-measure`. A harness per property found.
7. **Ship** — `measured-design-ship`. One navigable artifact, gates flagged.
8. Run `/drift` against the scope document and bring it level.

Do not skip to 3. If you cannot name the worst outcome, the later arguments have no tie-breaker.

## Output
`boards/`, `model/` with eight files plus a generated index, a harness set, and one navigable
artifact that opens with the network refused.
