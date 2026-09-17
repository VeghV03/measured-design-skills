---
description: Turn the design into a Jira structure — epics from journeys, stories from steps, sub-tasks from screens, spikes from open decisions — with real blockers, a build order, and criteria that name the check that proves them.
argument-hint: "[what is being planned, or the brief to read]"
---
# /backlog
Use `measured-design-backlog` when there is a `model/`. Use `jira-backlog` for any other project.

## Steps
1. Ask about the Jira instance and write `backlog.config.json` — project key, **team-managed or
   company-managed**, issue type names, the blocks link name, required fields. Ask per project; the
   wrong `style` imports every story unparented while appearing to succeed.
2. Build it. `python3 scaffold/backlog/build_backlog.py --model model` — or `--plan
   backlog.plan.json` when the source is a brief, a crawl or a codebase.
3. Read `backlog.md`. Fill the blank "so I can" lines, or accept them as unknown.
4. Check the blockers are preconditions and not sequence, and that no epic is one story.
5. Import `jira.csv` — or `--push --dry-run`, read it, then `--push`. Either way
   `backlog.keys.json` ends up mapping every unit to its ticket, so the next run reports added,
   changed and gone against a real board. Never pass `--yes` on the user's behalf.

## Output
One backlog somebody can build from: every epic an outcome, every open decision blocking what it
touches, every gap visible as a story with nothing serving it.
