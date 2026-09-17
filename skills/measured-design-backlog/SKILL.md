---
name: measured-design-backlog
description: Turn model/ into a Jira structure — journeys become epics, steps become stories, screens become sub-tasks, open decisions become spikes that block what they touch, and gaps become stories with nothing serving them. Acceptance criteria name the harness that proves them. Use when design work has to become planned work, when engineering asks what to build first, or when a backlog and a prototype have drifted apart.
---
# Backlog — the design, as planned work

**Output:** `backlog.md` to read, `jira.csv` to import, `backlog.json` to diff, `backlog.keys.json`
so the second run does not duplicate the first.

Reachable once stage 02 has produced journeys and routes, and worth running again after stage 05 —
the audit changes what the work actually is, and a backlog written before the audit is a plan for the
product you thought you had.

```sh
python3 scaffold/backlog/build_backlog.py --model model --title "File manager"
python3 scaffold/backlog/build_backlog.py --model model --push --dry-run   # then --push
```

## Why this is not a generic export

Most backlog generators have a list of screens and nothing else, so every ticket reads the same. This
one is reading a model that already answers the questions a planner would otherwise guess at:

| From | Becomes |
|---|---|
| `journeys.json` | epics, and the ordered steps inside them |
| a step | a story, named verbatim from the agreed scope |
| `screens.json` | sub-tasks, with `kind`, `group` and the empty-state flag |
| `routes.json` | the flow, and — via `parent` — the blockers that are real |
| `decisions.json`, status open | a **spike that blocks** every story touching its screens |
| `gaps.json` | a story flagged as having nothing serving it |
| `failures.json` | a criterion: the failure state says what is still true |
| `rationale.json` | the body — context, why the design is like this, the trade-off accepted |
| `policy.json` | a criterion naming the `vocab` check |

Nothing is invented on top of that. The one thing the model cannot answer is the **"so I can"** — what
the person walks away with — and it is left as a visible blank and counted in the summary rather than
filled with the nearest available sentence. A design rationale says why a screen is shaped the way it
is; it is not what somebody gets, and dressing one up as the other puts a claim nobody made into a
ticket somebody builds.

## What blocks what

Only genuine preconditions become Jira links:

- a **state** waits for the place it hangs off (`parent` in `screens.json`)
- the first story of every journey waits for the **entrance** — the screen reached by the `from: null`
  route, because nothing else matters until there is a way in
- every story touching an **open decision** waits for that decision

`files-list` leads to eight screens. Blocking all eight on it would be true to the route graph and
useless as a plan, so the rest of the graph becomes **rank** — a topological build order, which is
also the row order in the CSV, because Jira has no importable rank field.

## The criteria name the check

This is the part that only works here. A criterion a harness can prove says which one:

> - Files, Sync did not finish render at every supported width with nothing off the frame, a heading,
>   labelled controls, targets at or over the minimum, and no text under its contrast threshold in
>   either theme  `[overflow, structure, target-size, contrast]`
> - every route declared from these screens binds to a label that is on the board  `[routes]`
> - Sync did not finish says what is still true, not only what failed
> - no term the vocabulary policy forbids appears outside the zone that allows it  `[vocab]`

Done stops being a conversation. Three of those four have an answer that can be counted, and the
fourth is a judgement that is now visibly a judgement.

Generic criteria are deliberately not repeated per ticket. One line covering the screens this story
actually owns beats four identical lines on every ticket in the backlog — boilerplate is how a
generated backlog teaches people to stop reading it.

## A screen no journey mentions

`sync-failed` and `search-empty` serve no step. They are still real work, so each joins the story it
is **reached from** in the route graph, carrying a note saying the scope does not name it. An
"unmapped" epic would be tidier and nobody grooms it.

## Standing rules

**Creating tickets is the one irreversible step, and it is opt-in.** `--push` creates and never
edits, verifies the project and every issue type before sending, saves each key as it goes, and asks
before it starts. Read `backlog.md` first; `--dry-run` shows exactly what would be created. Never pass
`--yes` for somebody else.

**Nothing here refuses.** The gate has exactly one refusing check on purpose. A story blocked by an
unanswered decision is emitted and marked blocked, so the board shows the cost of not deciding rather
than hiding the work until somebody chooses.

**The audited prototype dictates.** Where the scope document and the model disagree, the backlog
follows the model, same as everywhere else in this pack — and `unagreed` screens carry a note to bring
the scope level before they ship. Run `/drift` alongside this.

**Re-runs are the point.** Identity is structural (`manage/move`), so rewording a story keeps its
ticket and only a restructure makes new work. Write the Jira keys into `backlog.keys.json` after
importing and a second run reports added, changed and gone against a real board.

## The Jira settings still have to be asked

The model knows the work. It does not know the instance. Project key, team-managed versus
company-managed, the issue type names, the blocks link name, required fields — ask per project and
write `backlog.config.json`. Getting `style` wrong imports every story unparented while appearing to
succeed. `scaffold/backlog/README.md` has the shape.

## Skills to invoke

- `design-ops-handoff-spec` — what a ticket has to carry for somebody to build without asking
- `cross-functional-alignment-decision-log` — the shape of a decision worth blocking work on
- `design-research-jobs-to-be-done` — the job story frame, and filling in the blanks the model left
- `ux-strategy-information-architecture` — when the journeys are not the right epics for this team

Thinking, run alongside:

- `thinking-theory-of-constraints` — which blocker sets the date, versus the ones that feel urgent
- `thinking-second-order` — what this split does to the second sprint
- `thinking-reversibility` — what should have been a spike rather than a story

## Stop condition

Every journey is an epic and every step is a story. Every open decision blocks something. Every gap is
visible as a story with nothing serving it. Every blank "so I can" has been filled by a person or
accepted as unknown. The CSV imports into the project it was configured for, and a second run reports
only what actually changed.
