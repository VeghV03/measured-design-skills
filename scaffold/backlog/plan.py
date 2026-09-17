#!/usr/bin/env python3
"""The plan — one structure every front end produces and the emitter consumes.

A brief, a crawled app, a routes file and `model/` are four different things to
read and one thing to write. Everything specific to where the work came from
stops here; everything below this line is the same for all of them.

The plan is authored or derived, never guessed at emit time. Identity is the
`id`, which is structural — `manage/move`, not a hash of the summary — so that
rewording a story keeps its ticket and restructuring the work is what creates a
new one. That is the right way round: a reworded story is the same work, and a
resplit epic is not.
"""
import hashlib
import json
import re
from pathlib import Path

KINDS = ("epic", "story", "subtask", "spike")
ID = re.compile(r"^[a-z0-9]+(?:[-/][a-z0-9]+)*$")


class PlanError(Exception):
    """Something in the plan cannot be emitted, said at the point it matters."""


def load(path: Path) -> dict:
    try:
        plan = json.loads(Path(path).read_text())
    except json.JSONDecodeError as e:
        raise PlanError(f"{path}: {e}")
    return resolve(plan)


def _units(plan):
    """Every work item, flattened, in declaration order.

    Sub-tasks live nested under their story when authored, because that is how a
    person thinks about them, and flat here, because that is how Jira stores them.
    """
    for e in plan.get("epics", []):
        yield "epic", e["id"], e
    for s in plan.get("stories", []):
        yield "story", s["id"], s
        for t in s.get("subtasks", []):
            yield "subtask", t["id"], t
    for k in plan.get("spikes", []):
        yield "spike", k["id"], k


def resolve(plan: dict) -> dict:
    """Validate, normalise the edges, rank, and size. Nothing here is optional.

    An emitter that silently drops a reference to a story nobody wrote produces a
    backlog with a hole in it that shows up three sprints later.
    """
    problems = []
    seen = {}
    for kind, uid, unit in _units(plan):
        if not uid or not ID.match(str(uid)):
            problems.append(f"{kind} id {uid!r} must be lowercase, and / or - separated")
        key = f"{kind}:{uid}"
        if key in seen:
            problems.append(f"{key} is declared twice")
        seen[key] = unit
        if not str(unit.get("name", "")).strip():
            problems.append(f"{key} has no name")

    epics = {e["id"] for e in plan.get("epics", [])}
    for s in plan.get("stories", []):
        if s.get("epic") not in epics:
            problems.append(f"story:{s['id']} sits under epic {s.get('epic')!r}, which is not declared")

    # Blockers are authored from whichever end reads better — a story says what it
    # is blocked by, a spike says what it blocks — and both become one edge set.
    edges = {}  # unit key -> set of unit keys it waits for
    def ref(r):
        return r if ":" in str(r) else f"story:{r}"

    for s in plan.get("stories", []):
        edges.setdefault(f"story:{s['id']}", set()).update(ref(b) for b in s.get("blocked_by", []))
    for k in plan.get("spikes", []):
        for b in k.get("blocks", []):
            edges.setdefault(ref(b), set()).add(f"spike:{k['id']}")

    for src, targets in edges.items():
        for t in targets:
            if t not in seen:
                problems.append(f"{src} is blocked by {t}, which is not declared")

    if problems:
        raise PlanError("the plan does not resolve\n  " + "\n  ".join(problems))

    order = _rank(seen, edges)
    for kind, uid, unit in _units(plan):
        key = f"{kind}:{uid}"
        unit["_key"] = key
        unit["_kind"] = kind
        unit["_rank"] = order[key]
        unit["_blocked_by"] = sorted(edges.get(key, ()))
        if kind == "story":
            unit["_size"] = _size(unit, edges.get(key, ()))
    plan["_index"] = seen
    return plan


def _rank(seen, edges):
    """Suggested build order: nothing is ranked before what it waits for.

    A cycle is a real finding about the plan, not a crash — two stories that each
    wait for the other is something a person has to break. It is named and then
    ranked arbitrarily so the rest of the backlog still emits.
    """
    order, mark = {}, {}

    def visit(key, stack):
        if key in order:
            return
        if mark.get(key) == "open":
            raise PlanError("blocked-by cycle: " + " → ".join(stack + [key]))
        mark[key] = "open"
        for dep in sorted(edges.get(key, ())):
            if dep in seen:
                visit(dep, stack + [key])
        mark[key] = "done"
        order[key] = len(order) + 1

    for key in seen:
        visit(key, [])
    return order


def _size(story, blockers):
    """A count, not an estimate.

    Nothing here knows how long anything takes. It knows how many things a story
    carries, which is the only honest thing a generator can say — and saying it as
    S/M/L rather than as points keeps it from being mistaken for a commitment.
    """
    weight = len(story.get("subtasks", [])) + len(story.get("criteria", [])) + len(blockers)
    return "S" if weight <= 3 else ("M" if weight <= 7 else "L")


def content_hash(unit) -> str:
    """What a re-run compares. Covers everything a reader would notice changing —
    wording, criteria, blockers — and nothing they would not, so a rebuild that
    changes only key order does not report every ticket as edited."""
    body = json.dumps({k: v for k, v in sorted(unit.items()) if not k.startswith("_")},
                      sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(body.encode()).hexdigest()[:12]


def n(count, singular, plural=None):
    """A backlog that says "1 spikes" reads as generated, and a backlog that reads
    as generated gets skimmed. Cheap to get right, expensive to leave wrong."""
    return f"{count} {singular if count == 1 else (plural or singular + 's')}"


def summarise(plan) -> str:
    counts = {k: 0 for k in KINDS}
    for kind, _, _ in _units(plan):
        counts[kind] += 1
    blocked = sum(1 for _, _, u in _units(plan) if u.get("_blocked_by"))
    nothing = sum(1 for s in plan.get("stories", []) if s.get("nothing_serves"))
    # The blank outcome is counted rather than hidden. It is the one line a
    # generator cannot write, and a number is how it stays visible.
    blank = sum(1 for s in plan.get("stories", []) if not (s.get("job") or {}).get("so"))
    out = " · ".join([n(counts["epic"], "epic"), n(counts["story"], "story", "stories"),
                      n(counts["subtask"], "sub-task"), n(counts["spike"], "spike"),
                      f"{blocked} blocked"])
    if nothing:
        out += f" · {nothing} with nothing serving {'it' if nothing == 1 else 'them'}"
    if blank:
        out += f" · {blank} still {'needs' if blank == 1 else 'need'} their \"so I can\""
    return out
