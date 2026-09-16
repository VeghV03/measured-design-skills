---
name: measured-design
description: Run a product design from an agreed scope document to a measured, engineering-ready prototype, where most questions have an answer that can be counted. Use when starting a design project, picking up one mid-flight, or when asked to audit or measure an existing design. Routes to six stage skills — frame, structure, generate, audit, measure, ship — and to the measured-design library.
---
# Designing a product you can prove

Design reviews go wrong in a predictable way: two people hold different opinions about a screen,
the more senior opinion wins, and nobody learns anything. The fix is not more process. It is
arranging the work so that most questions have an answer that can be counted, and spending the
meeting only on the ones that genuinely cannot.

The deliverable is not a set of screens. It is a set of screens plus the machinery that proves they
are still coherent after the next change. The expensive failure is never the first version. It is
version eleven, where three screens quietly contradict each other and nobody notices for a month.

## The test for a good finding

A finding is worth having if it would change what someone builds. "This feels cluttered" fails.
"Nine screens have no heading element, so a screen-reader user cannot tell where they are" passes,
because there is now a definite thing to do and a definite way to know it is done.

Apply that test to your own output. If you produce a sentence nobody could act on, delete it.

## The six stages

| Stage | Skill | Output |
|---|---|---|
| 01 Frame | `measured-design-frame` | problem statement, audience, the one worst outcome, vocabulary policy |
| 02 Structure | `measured-design-structure` | journeys, product IA, a recorded list of what nothing serves |
| 03 Generate | `measured-design-generate` | every screen as build output, from one design system in code |
| 04 Audit | `measured-design-audit` | answered decisions, findings that name a file and a line |
| 05 Measure | `measured-design-measure` | a harness per property, each printing one number |
| 06 Ship | `measured-design-ship` | one navigable artifact, and a sync discipline |

Stages are not gates you pass once. Audit sends work back to generate; measure sends work back to
audit. Only the contract is fixed.

## Two standing rules

Run the designer skills and the thinking skills together. A design skill tells you what good looks
like in its own lane. A thinking skill catches what that lane's answer breaks two screens away. Each
stage skill names both. When a stage skill's pairing does not fit the situation, use
`thinking-model-router` to pick instead.

Where a prototype and a scope document both exist, the audited prototype dictates. The scope
document is brought level with it, not the other way round — otherwise every audit finding is
optional. `measured-design-drift` is how you keep them level.

## Before anything else

Read `measured-design-contract`. Every stage writes into `model/`, and the eight files there are the
whole data model. Anything not in them can never be measured.

## Where the library is

`skills/library/` holds 88 vendored designer and thinking skills, named in collection-qualified form
(`ux-strategy-frame-problem`, not `frame-problem`). They do not self-invoke. Read
`skills/library/INDEX.md` for the full map, and invoke them by name from a stage.
