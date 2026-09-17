---
name: jira-backlog
description: Turn a brief, a running app, or a codebase into a Jira structure — epics, stories, sub-tasks and decision spikes, with real dependencies, build order, and stories written well enough that somebody can build from them without asking. Produces a reviewable file and a Jira CSV, never a surprise board. Use when asked to plan work, break a product into tickets, build a backlog or a roadmap, or turn a spec into Jira.
---
# Turn a product into a backlog somebody can build from

**Output:** `backlog.plan.json`, and from it `backlog.md` to read, `jira.csv` to import,
`backlog.keys.json` so the second run does not duplicate the first.

Most generated backlogs fail the same way. Every ticket says the same four sentences in a different
order, nothing says what depends on what, and the parts nobody decided yet are written as if they
were decided. The result is a board that looks like a plan and cannot be built from.

Three rules fix most of it, and they are the ones to hold onto when the rest of this file is out of
context:

1. **Never invent the reason.** If the source does not say what a person gets out of a step, leave
   the blank visible. A plausible sentence in a ticket becomes a requirement somebody builds.
2. **Blockers are preconditions, not sequence.** Only what genuinely cannot start. Everything else is
   rank order.
3. **Write the unit, not the template.** A story should say what this thing does, what it must never
   do, what it looks like empty and broken, and how anyone would know it is finished.

## 1 · Ask about the Jira before writing anything

None of this can be guessed, and every one of them silently breaks an import:

- **Project key**, and whether everything lands in one project.
- **Team-managed or company-managed?** The single most important answer. Company-managed links
  stories to epics through `Epic Link` carrying the epic's `Epic Name`; team-managed has no
  `Epic Name` and uses `Parent ID`. The wrong one imports "successfully" with every story orphaned.
  If they do not know: in Jira, Project settings → Details shows the type.
- **Issue type names as they exist in that instance** — `Story` or `User Story`? Is there a `Spike`
  type at all? Many instances have none, and decisions become `Task` with a `spike` label.
- **Sub-task type name** — `Sub-task`, `Subtask`, or disabled entirely.
- **The blocks link name** — usually `Blocks`, often renamed.
- **Required fields on create** — Components, Team and Acceptance Criteria are commonly mandatory and
  will reject the whole import.
- **Labels** to apply to everything.

Write the answers to `backlog.config.json`. The shape is in `scaffold/backlog/README.md`.

Ask these **per project**. Do not carry an answer over from the last one.

## 2 · Read the source

### A brief, PRD or spec

The epics are the outcomes it promises. The stories are the steps to each one. Take step names
**verbatim** from the document — a paraphrase creates a second name for one thing, and then nobody
can tell whether they are the same work.

Read it twice. The first pass finds what it says; the second finds what it assumes. What it assumes
is where the gaps and the unmade decisions are, and those are the highest-value tickets in the
output.

### A running app

Crawl it. `scaffold/harnesses/lib.mjs` already does this — point `target` at
`{ "mode": "crawl", "start": "http://localhost:3000" }` and it returns every same-origin page with a
name. Each page is a candidate sub-task; the link graph is the dependency graph; pages that share a
path prefix are usually one epic.

Then say plainly which part is inference. A crawl knows what exists, never what it is for.

### A codebase

Read the router — `app/`, `pages/`, a routes file, a nav config. That gives the surfaces and often
the hierarchy. Components under a route are its sub-tasks. This is the most accurate source for the
app **as built** and says nothing at all about what is missing, so pair it with a brief if there is one.

## 3 · Group it

- **Epic** — an outcome someone achieves, named the way they would name it. "Manage files", not
  "Files module". If an epic has one story, it is not an epic; fold it in.
- **Story** — one step toward that outcome. The unit a person could pick up on a Monday.
- **Sub-task** — a screen, state or component the story needs. Not a checklist of the work; the
  acceptance criteria do that.
- **Spike** — a decision nobody has made. It is work, it has an owner, and until it is answered both
  options are live, so it **blocks** what it touches.

Where two things are genuinely one unit, merge them. Where a story has more than about eight
sub-tasks, say so and let a person split it — do not split it silently, because the split is a
judgement about how the team works and nothing here knows that.

## 4 · Find the real dependencies

Put in `blocked_by` **only what cannot start**:

- a state or detour needs the place it hangs off
- nothing can be built before there is a way into the product
- anything touching an open decision waits for that decision
- a shared component both stories need, when one of them builds it

Everything else — the click path, the reading order, "it would be nice to do this first" — is
sequence. Sequence is already carried by rank, computed from the blockers. A backlog where everything
blocks everything has its links deleted in the first week, and then the real blockers go with them.

## 5 · Write the stories

The frame is a job story, because it forces the trigger to be named:

> **When** I am in Files and choose Move to folder…, **I want to** move a file into a folder,
> **so I can** ⟨what the person walks away with⟩.

If the source does not say what the person walks away with, **leave it blank**. The emitter prints a
visible placeholder and counts the blanks in the summary. This is the most important rule here: the
reason for a step is exactly the thing a generator is most tempted to fabricate and least able to know.

Under the frame, the body says what somebody actually needs in order to build it:

- what this unit does, in the product's own words
- what it must never do, if the answer is not obvious
- what it looks like with nothing in it, and what it says when it fails
- what it assumes already exists

Then acceptance criteria — a checklist, and **anything a test can prove names the check that proves
it**. In a measured-design project those are the harnesses (`contrast`, `structure`, `overflow`,
`target-size`, `routes`, `vocab`). In any other project they are that project's tests and linters.
A criterion that can only be settled by opinion is fine; it just should not pretend otherwise.

Do not pad. Four criteria that matter beat twelve that recite the definition of done.

If the project has a vocabulary policy — a list of words the product does or does not use — the
tickets obey it too. The backlog should speak the same language as the interface.

## 6 · Emit, read, then import

```sh
python3 scaffold/backlog/build_backlog.py --plan backlog.plan.json
```

Writes `backlog.json` (canonical, diff this), `jira.csv` (the import), `backlog.md` (read this), and
`backlog.keys.json` (the map to real tickets).

**Read `backlog.md` before importing.** Generating is reversible right up until it becomes sixty real
tickets somebody has to clean up by hand. Check the blank outcomes, check the blockers are real, check
no epic is one story.

Then import the CSV — or create the issues directly:

```sh
export JIRA_BASE_URL=... JIRA_EMAIL=... JIRA_API_TOKEN=...
python3 scaffold/backlog/build_backlog.py --plan backlog.plan.json --push --dry-run
python3 scaffold/backlog/build_backlog.py --plan backlog.plan.json --push
```

`--push` creates and never edits, checks the project and every issue type before sending anything,
writes each key to `backlog.keys.json` as it goes so a failed run can be retried without duplicating,
and prints the whole plan and asks before it starts. **Run `--dry-run` first, and read what it says it
will create.** Never pass `--yes` on somebody's behalf — the confirmation is the point of the flag.

Credentials come from the environment only. Do not put a token in `backlog.config.json`, and do not
ask the user to paste one into the chat — tell them to export it in their own shell.

## 7 · Running it again

Identity is structural, so a reworded story keeps its ticket and only a restructure makes new work.
A second run reports **added**, **changed** and **gone**, and never duplicates. Write the Jira keys
into `backlog.keys.json` after importing and the map keeps the generated plan and the real board in step.

A unit that disappears keeps its entry if it was ever imported. The plan can forget a story; Jira
cannot, and somebody has to go and close it.

## Skills to invoke

- `design-research-jobs-to-be-done` — the job story frame, and what makes a trigger real
- `ux-strategy-information-architecture` — grouping, when the epics are not obvious from the source
- `cross-functional-alignment-decision-log` — the shape of a decision worth blocking work on
- `design-ops-handoff-spec` — what a ticket has to carry for somebody to build without asking
- `prototyping-testing-user-flow-diagram` — recovering the flow when the source is a crawl or a codebase

Thinking, run alongside:

- `thinking-theory-of-constraints` — the blocker that actually sets the delivery date, versus the
  fifteen that feel urgent
- `thinking-second-order` — what a split into these epics does to the second sprint, not the first
- `thinking-opportunity-cost` — an epic is also a decision not to build something else
- `thinking-reversibility` — which of these tickets is expensive to be wrong about, and should be a
  spike instead

## Stop condition

Every epic is an outcome, not a module. Every story says what a person gets or admits it does not
know. Every blocker is a real precondition. Every unmade decision is a spike that blocks something
rather than a sentence in a description. The CSV imports into the project it was configured for, and
a second run changes nothing that did not change.
