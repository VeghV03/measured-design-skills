# measured-design

Take a product from an agreed scope document to a measured, engineering-ready prototype, where most
questions have an answer that can be counted.

Read `skills/measured-design/SKILL.md` first. It routes to the six stages.
Read `skills/measured-design-contract/SKILL.md` before generating a screen, writing a harness, or
adding any field to the data model.

## Layout

```
skills/measured-design*          eleven skills — the procedure itself
skills/jira-backlog/             standalone: any project → a Jira structure
skills/library/                  88 vendored designer and thinking skills, collection-qualified
cli/                             npx measured-design init|check|baseline|waive — the no-adoption entry
cli/ratchet.mjs                  baseline, waivers, and new-versus-known
commands/                        slash commands for agents that have them
scaffold/gate.py                 the build gate — refuses on a route that does not bind
scaffold/drift.py                scope document versus model
scaffold/check_library.py        every vendored skill must be reachable from a stage
scaffold/harnesses/              thirteen checks, twelve in any one run, each prints one number
                                 and writes one record per finding, fingerprinted
scaffold/backlog/                the plan, and one emitter: backlog.json, jira.csv, backlog.md
scaffold/viewer/                 the handover artifact, no dependencies
scaffold/adapters/python/        the reference generator; one adapter, not the requirement
scaffold/adapters/node/          a second generator, no dependencies, proving the contract holds
scaffold/adapters/react/         a third generator; emits boards and .tsx components from one tree
examples/demo/                   ten screens across four journeys that build, gate, and ship end to end
```

## The short version

Screens are compiled, not drawn. The rationale lives in the generator and is extracted at build time,
so it cannot drift from the screen. Every declared route must bind or the build refuses. Every audit
finding that would change what someone builds becomes a harness that prints a count. Where a scope
document and a prototype disagree, the audited prototype dictates.

A count is only worth taking if something remembers it. `measured-design baseline` freezes what is
already there; `check --no-new` fails on what is not in the baseline. Nobody fixes 158 things —
everybody can stop the 159th. Disagreement is recorded as a waiver with a reason and a date, never
settled by deleting the check.

## If you have no slash commands

Invoke the skills by name. `measured-design` is the entry point; the rest are reached from it. The
library skills are marked `disable-model-invocation` — reach them deliberately from a stage, not
opportunistically.
