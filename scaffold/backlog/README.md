# backlog/ — the plan, and the one emitter that reads it

Four things can produce a backlog: a written brief, a crawled app, a codebase's routes, and a
measured-design `model/`. They are four different reading problems and one writing problem. The
**plan** is where they meet.

```
brief / crawl / routes / model   →   backlog.plan.json   →   backlog.json
                                                             jira.csv
                                                             backlog.md
                                                             backlog.keys.json
```

Everything specific to where the work came from stops at the plan. `emit.py` never learns which
front end produced it, which is why a better front end never needs a second emitter.

## Files

| | |
|---|---|
| `plan.py` | the plan: validate, resolve blockers, rank, size. Refuses a plan that does not resolve. |
| `emit.py` | the shared emitter — `backlog.json`, `jira.csv`, `backlog.md` |
| `build_backlog.py` | the entry point, and the re-run diff |
| `from_model.py` | the measured-design front end: `model/` → plan |
| `push.py` | `--push`: create the missing issues in Jira. The only part that reaches outside |
| `push_test.py` | every push guard, against a stubbed Jira — no network, run in CI |

```sh
python3 build_backlog.py --plan backlog.plan.json      # any project
python3 build_backlog.py --model model                 # a measured-design project
python3 build_backlog.py --model model --push --dry-run
```

Generating is reversible, creating tickets is not, and the step between them is a person reading
`backlog.md`. That is why push is a separate flag rather than the default.

## Push

```sh
export JIRA_BASE_URL=https://your-domain.atlassian.net
export JIRA_EMAIL=you@example.com
export JIRA_API_TOKEN=...          # id.atlassian.com → Security → API tokens

python3 build_backlog.py --model model --push --dry-run   # show the plan, send nothing
python3 build_backlog.py --model model --push             # print the plan, ask, then create
python3 build_backlog.py --model model --push --yes       # skip the question
```

Credentials come from the environment. They are never read from a file in the repo, never written to
one, and never printed.

**It creates, it never edits.** A ticket that exists has a life of its own — comments, an assignee,
edits somebody made on purpose. A unit whose content has changed since it was pushed is *reported* and
left alone. Overwriting a colleague's edits from a generator is not a sync, it is data loss.

**It writes the map down as it goes.** Every key lands in `backlog.keys.json` immediately, not at the
end, so a run that dies halfway can be retried without producing a second copy of what it already made.

**It checks the whole project before creating anything.** The project must be readable, every issue
type in the config must exist, and the blocks link type must exist. A run that creates nine issues and
then discovers the tenth type is missing leaves somebody deleting nine issues by hand.

**It asks.** The full plan is printed and confirmed before anything is sent. With no terminal to ask
at, `--yes` is required — so nothing in CI can create tickets by accident.

Order is epics, then stories and spikes, then sub-tasks, then links — a child is never sent before its
parent has a key. Issues are created through `/rest/api/2`, which takes a plain-text description;
v3 would need the same words rebuilt as an Atlassian Document Format tree.

Modern Jira Cloud parents every level with `parent`. Older company-managed instances still want the
Epic Link and Epic Name custom fields, so both stay configurable rather than assumed:

```json
{ "epicLinkField": "customfield_10014", "epicNameField": "customfield_10011" }
```

## The plan

```json
{
  "version": 1,
  "title": "File manager",
  "epics": [
    { "id": "manage", "name": "Manage files", "intent": "...", "labels": ["files"] }
  ],
  "stories": [
    { "id": "manage/move",
      "epic": "manage",
      "name": "Move a file into a folder",
      "job": { "when": "I am in Files and choose Move to folder…",
               "want": "move a file into a folder",
               "so": "" },
      "body": "What this unit does, and what it must never do.",
      "criteria": [ { "text": "…", "check": "structure" } ],
      "subtasks": [ { "id": "files-move", "name": "Move to folder", "body": "…" } ],
      "blocked_by": ["manage/see", "spike:d-001"],
      "notes": ["…"],
      "labels": ["files"],
      "nothing_serves": false }
  ],
  "spikes": [
    { "id": "d-001", "name": "Decide: …", "question": "…", "context": "…",
      "options": [ { "label": "…", "buys": "…", "costs": "…", "kills": "…" } ],
      "right_if": "…", "blocks": ["manage/see"], "epic": "manage" }
  ]
}
```

**Identity is the `id`, and the `id` is structural.** `manage/move`, never a hash of the summary.
Reword a story and it keeps its ticket; split an epic and you have made new work, which is the
correct way round. Ids are lowercase, separated by `-` or `/`.

**Blockers are authored from whichever end reads better.** A story says what it is `blocked_by`; a
spike says what it `blocks`. Both become one edge set. A bare string in `blocked_by` means a story —
write `spike:d-001` for anything else. A reference to something nobody declared stops the build,
because a backlog with a hole in it is discovered three sprints later.

**`so` may be left empty and often should be.** It is the one line a generator cannot write: what the
person walks away with. An empty `so` becomes a visible blank in the ticket and is counted in the
summary. Filling it with the nearest available sentence — a design rationale, a restatement of the
title — puts a claim nobody made into a ticket somebody builds.

**Only real preconditions belong in `blocked_by`.** A state cannot be built before the place it hangs
off; nothing can be built before there is a way into the product; nothing touching an open decision
can be built while both options are live. Everything else the flow knows is sequence, and sequence is
already carried by rank. A board where everything blocks everything gets its links deleted in week one.

## Ranking and size

`rank` is a topological order over the blockers: nothing is ranked before what it waits for. The CSV
has no importable rank field, so **row order is the only sequence Jira honours** — which makes the
sort the feature, not a presentation detail. A blocked-by cycle is refused by name rather than
silently broken.

`size` is S/M/L from a count — sub-tasks plus criteria plus blockers. It is not an estimate and says
so on every ticket. Nothing here knows how long anything takes.

## Re-runs

`backlog.keys.json` maps each unit to the ticket it became. A second run reports **added**, **changed**
and **gone**, and never emits a duplicate. A unit that disappears from the plan keeps its entry if a
Jira key was ever recorded against it — the plan can forget a story, Jira cannot, and somebody has to
go and close it.

Write the Jira key into the map after importing, and the map becomes the thing that keeps a generated
backlog and a real board in step.

## The Jira settings

`backlog.config.json` — none of it can be guessed, all of it breaks an import silently when wrong:

```json
{
  "project":    { "key": "FILES", "style": "company-managed" },
  "issueTypes": { "epic": "Epic", "story": "Story", "subtask": "Sub-task", "spike": "Spike" },
  "linkTypes":  { "blocks": "Blocks" },
  "labels":     ["ux"],
  "fields":     { "Components": "Frontend" }
}
```

`style` is the one that matters most. **company-managed** links a story to its epic through `Epic
Link`, carrying the epic's `Epic Name`. **team-managed** has no `Epic Name` at all and uses `Parent
ID` for both levels. Emit the wrong one and the import appears to succeed while leaving every story
unparented.

Ask for these per project. Plenty of instances have no `Spike` type, call a story `User Story`, or
require a field on create that nothing else mentions.

## Adding a front end

Write something that produces a plan and hand it to `build_backlog.py --plan`. That is the whole
contract. `from_model.py` is the reference, not the requirement — it is about 150 lines, and most of
it is deciding what *not* to invent.
