# measured-design

**Designing a product you can prove.** The Solar Punk UX/UI procedure, as an installable pack for
Claude Code, Codex, and any agent that reads `SKILL.md`.

Design reviews go wrong in a predictable way: two people hold different opinions about a screen, the
more senior opinion wins, and nobody learns anything. The fix is not more process. It is arranging
the work so that most questions have an answer that can be counted, and spending the meeting only on
the ones that genuinely cannot.

```
158 → 0   jargon words outside Advanced
 42 → 0   screens with no heading
 22 → 0   routes pointing at nothing
 14 → 0   chips painting over a column
```

Every one of those was invisible until something counted it. None would have come up in a review.

## Install

```sh
sh scripts/install.sh claude          # ~/.claude/skills
sh scripts/install.sh codex           # ~/.agents/skills
sh scripts/install.sh any ./skills    # anywhere else
```

Add `--core` to install the ten measured-design skills without the 88-skill library. Codex caps its
pre-loaded skill list at about 8,000 characters and truncates silently past that; 98 skills would not
fit. The library skills are marked `disable-model-invocation` for the same reason — they are reached
deliberately from a stage, not picked up opportunistically.

Claude Code can also add the directory as a marketplace (`.claude-plugin/marketplace.json`).

## What is in it

| | |
|---|---|
| `skills/measured-design` | the entry point; routes to the six stages |
| `skills/measured-design-contract` | the build contract — read before generating anything |
| `skills/measured-design-{frame,structure,generate,audit,measure,ship}` | stages 01–06 |
| `skills/measured-design-decide` | an open question forced into multiple choice with trade-offs |
| `skills/measured-design-drift` | scope document versus prototype |
| `skills/library/` | 88 vendored designer and thinking skills |
| `commands/` | `/prove` and nine others, for agents with slash commands |
| `scaffold/gate.py` | refuses the build on a route that does not bind |
| `scaffold/harnesses/` | nine checks, each prints one number |
| `scaffold/viewer/` | the handover artifact — one file, no dependencies |
| `scaffold/adapters/python/` | the reference generator |
| `examples/demo/` | six screens that build, gate and ship end to end |

## Try it in thirty seconds

```sh
cd examples/demo
python3 ../../scaffold/adapters/python/build.py  --boards boards --model model
python3 ../../scaffold/gate.py                   --model model --boards boards
python3 ../../scaffold/viewer/build_viewer.py    --model model --boards boards --out prototype.html
python3 ../../scaffold/drift.py scope.md         --model model
open prototype.html
```

The gate prints one line per property and writes `model/index.json`. Break a route label in
`routes.json` and it refuses instead, which is the point.

For the harnesses: `cd scaffold/harnesses && npm install && node run-all.mjs`. They need Playwright
and a Chromium; set `executablePath` in `harness.config.json` if yours is not on the default path.

## The three things that make this different from a process document

**Screens are compiled, not drawn.** A design tool gives you 93 files that drift; a generator gives
you 93 files that cannot. Any stack satisfies the contract — Python is the reference adapter, not the
requirement.

**The rationale lives in the generator.** Put it in the docstring and extract it at build time, and
the reasoning physically cannot drift from the screen, because they are the same object. There is no
separate rationale document going stale in a fortnight.

**One check refuses.** A route map that lies to QA is worse than a missing one, so the gate will not
produce a prototype if a declared route fails to bind. Everything else prints a number and lets a
person decide. Adding a second refusing check is a decision with a cost, and the pack says so.

## Two standing rules

Run the designer skills and the thinking skills together. A design skill tells you what good looks
like in its own lane; a thinking skill catches what that lane's answer breaks two screens away. The
per-stage pairing is a **proposal** and is written up separately in `PAIRING.md` — it is the one part
of this pack that is not in the source procedure.

Where a prototype and a scope document both exist, the audited prototype dictates. The scope document
is brought level with it, not the other way round, otherwise every audit finding is optional.

## Provenance and licences

The procedure is derived from the Swarm Desktop File Manager redesign, Solar Punk, September 2026.
The worked examples throughout are from that project.

`skills/library/` vendors 88 skills from two MIT-licensed repositories, unmodified except for the
frontmatter `name` and a provenance comment:

- **designer-skills** — MIT, MC Dean. `licenses/designer-skills-MIT.txt`
- **cc-thinking-skills** — MIT, TJ Boudreaux. `licenses/cc-thinking-skills-MIT.txt`

Every vendored skill is renamed to a collection-qualified form — `ux-strategy-frame-problem`, not
`frame-problem`. Codex does not merge skills sharing a `name`; it shows both in the selector. If you
have the upstream packs installed as well, nothing collides. `skills/library/INDEX.md` maps every
qualified name back to its upstream id.

This pack is MIT. See `LICENSE`.
