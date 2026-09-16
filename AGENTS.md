# measured-design

Take a product from an agreed scope document to a measured, engineering-ready prototype, where most
questions have an answer that can be counted.

Read `skills/measured-design/SKILL.md` first. It routes to the six stages.
Read `skills/measured-design-contract/SKILL.md` before generating a screen, writing a harness, or
adding any field to the data model.

## Layout

```
skills/measured-design*          ten skills — the procedure itself
skills/library/                  88 vendored designer and thinking skills, collection-qualified
commands/                        slash commands for agents that have them
scaffold/gate.py                 the build gate — refuses on a route that does not bind
scaffold/drift.py                scope document versus model
scaffold/harnesses/              nine checks, each prints one number
scaffold/viewer/                 the handover artifact, no dependencies
scaffold/adapters/python/        the reference generator; one adapter, not the requirement
examples/demo/                   six screens that build, gate, and ship end to end
```

## The short version

Screens are compiled, not drawn. The rationale lives in the generator and is extracted at build time,
so it cannot drift from the screen. Every declared route must bind or the build refuses. Every audit
finding that would change what someone builds becomes a harness that prints a count. Where a scope
document and a prototype disagree, the audited prototype dictates.

## If you have no slash commands

Invoke the skills by name. `measured-design` is the entry point; the rest are reached from it. The
library skills are marked `disable-model-invocation` — reach them deliberately from a stage, not
opportunistically.
