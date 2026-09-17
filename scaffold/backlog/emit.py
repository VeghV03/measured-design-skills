#!/usr/bin/env python3
"""The shared emitter. One plan in, three files out.

`backlog.json` is the canonical record — diff it, review it, keep it in the repo.
`jira.csv` is the import. `backlog.md` is the thing you read before importing
anything, because a backlog nobody read is a backlog nobody agreed to.

Nothing here talks to Jira. Generating and pushing are separate on purpose: a
generated backlog is reviewable and reversible right up until it becomes 60 real
tickets, and that step should be a person's, taken once they have read the file.
"""
import csv
import json
from pathlib import Path

from plan import KINDS, content_hash, n as _n

# Every one of these is instance-specific and none can be guessed. A Jira with no
# Spike type, a Story called "User Story", a blocks link somebody renamed — each
# one silently breaks an import. The skill asks per project; these are only what
# it falls back to when nothing was asked.
DEFAULT_CONFIG = {
    "project": {"key": "PROJ", "style": "company-managed"},
    "issueTypes": {"epic": "Epic", "story": "Story", "subtask": "Sub-task", "spike": "Spike"},
    "linkTypes": {"blocks": "Blocks"},
    "labels": [],
    "fields": {},
}


def load_config(path):
    cfg = json.loads(json.dumps(DEFAULT_CONFIG))
    if path and Path(path).exists():
        user = json.loads(Path(path).read_text())
        for k, v in user.items():
            if isinstance(v, dict) and isinstance(cfg.get(k), dict):
                cfg[k].update(v)
            else:
                cfg[k] = v
    return cfg


def _rows(plan):
    """Units in build order. The CSV has no importable rank field, so row order is
    the only sequence Jira will actually honour — which makes sorting here the
    whole of the ordering feature, not a presentation detail."""
    units = []
    for e in plan.get("epics", []):
        units.append(e)
    for s in plan.get("stories", []):
        units.append(s)
        units.extend(s.get("subtasks", []))
    units.extend(plan.get("spikes", []))
    return sorted(units, key=lambda u: u["_rank"])


def issue_id(key):
    """A CSV-local id. Jira matches Parent ID and link targets against these
    within the one file, so they only have to be unique and stable here."""
    kind, uid = key.split(":", 1)
    return {"epic": "E", "story": "S", "subtask": "T", "spike": "K"}[kind] + "-" + uid.replace("/", "-")


def _parent_of(plan):
    """Sub-task → its story, story → its epic. Read once rather than searched per row."""
    parent = {}
    for s in plan.get("stories", []):
        parent[s["_key"]] = f"epic:{s['epic']}"
        for t in s.get("subtasks", []):
            parent[t["_key"]] = s["_key"]
    # A spike may name an epic. It is optional — a decision that cuts across the
    # whole product genuinely belongs at the root rather than filed under one epic.
    for k in plan.get("spikes", []):
        if k.get("epic"):
            parent[k["_key"]] = f"epic:{k['epic']}"
    return parent


def describe(unit, plan):
    """The ticket body. Plain text, because CSV import renders wiki markup in some
    project types and prints it verbatim in others, and a ticket full of stray
    asterisks is worse than a plain one."""
    out = []
    kind = unit["_kind"]

    if kind == "story":
        job = unit.get("job") or {}
        if job.get("want"):
            lead = f"When {job['when']}, I want to {job['want']}" if job.get("when") else f"I want to {job['want']}"
            # The outcome is left as a visible blank rather than filled with the
            # nearest available sentence. A design rationale explains why a screen
            # looks as it does; it is not what the person gets, and dressing one up
            # as the other puts a claim nobody made into a ticket somebody builds.
            out.append(lead + (f", so I can {job['so']}." if job.get("so")
                               else ", so I can ⟨outcome — one line, from whoever knows why this step exists⟩."))
        if unit.get("body"):
            out += ["", unit["body"]]
        if unit.get("nothing_serves"):
            out += ["", "Nothing serves this yet. The scope asks for it and no screen was designed for it; "
                        "the design work is part of this story."]
        crit = unit.get("criteria") or []
        if crit:
            out += ["", "Acceptance criteria"]
            for c in crit:
                proof = f"  [{c['check']}]" if c.get("check") else ""
                out.append(f"- {c['text']}{proof}")
            if any(c.get("check") for c in crit):
                out += ["", "Criteria marked with a check in brackets are proved by that harness, "
                            "not by opinion. Run them before closing this."]
        out += ["", f"Size hint: {unit['_size']} — {_n(len(unit.get('subtasks', [])), 'sub-task')}, "
                    f"{_n(len(crit), 'criterion', 'criteria')}, {_n(len(unit['_blocked_by']), 'blocker')}. "
                    "A count, not an estimate."]

    elif kind == "spike":
        out.append(unit.get("question", ""))
        if unit.get("context"):
            out += ["", unit["context"]]
        for o in unit.get("options", []):
            out += ["", f"Option: {o.get('label','')}",
                    f"- buys: {o.get('buys','')}",
                    f"- costs: {o.get('costs','')}",
                    f"- kills: {o.get('kills','')}"]
        if unit.get("right_if"):
            out += ["", f"Right if: {unit['right_if']}"]
        out += ["", "This is not an estimate task. Nothing it blocks should be built until it is answered, "
                    "because both options are still live and they build different things."]

    else:
        if unit.get("intent") or unit.get("body"):
            out.append(unit.get("intent") or unit.get("body"))

    for n in unit.get("notes", []):
        out += ["", f"Note: {n}"]

    waits = [plan["_index"][b] for b in unit["_blocked_by"] if b in plan["_index"]]
    if waits:
        out += ["", "Waits for: " + ", ".join(f"{w['name']} ({issue_id(w['_key'])})" for w in waits)]

    return "\n".join(out).strip()


def to_csv(plan, cfg, path):
    """Jira's importer, shaped by the project style.

    Company-managed links a story to its epic through Epic Link, carrying the
    epic's Epic Name. Team-managed has no Epic Name at all and uses Parent ID for
    both levels. Emitting the wrong one produces an import that appears to work
    and silently leaves every story unparented.
    """
    style = cfg["project"]["style"]
    types, blocks_name = cfg["issueTypes"], cfg["linkTypes"]["blocks"]
    parent = _parent_of(plan)
    rows = _rows(plan)

    # Our edges say "X waits for Y". Jira's column says "this row blocks that one",
    # so the edge is written from the other end.
    blocks = {}
    for u in rows:
        for dep in u["_blocked_by"]:
            blocks.setdefault(dep, []).append(issue_id(u["_key"]))

    extra = list(cfg.get("fields", {}).keys())
    max_labels = max((len(_labels(u, cfg)) for u in rows), default=0)
    max_links = max((len(blocks.get(u["_key"], [])) for u in rows), default=0)

    header = ["Issue ID", "Issue Type", "Summary", "Description"]
    if style == "company-managed":
        header += ["Epic Name", "Epic Link"]
    header += ["Parent ID"]
    header += ["Labels"] * max_labels
    header += [f'Link "{blocks_name}"'] * max_links
    header += extra

    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        for u in rows:
            kind = u["_kind"]
            row = [issue_id(u["_key"]), types[kind], u["name"], describe(u, plan)]

            par = parent.get(u["_key"])
            if style == "company-managed":
                epic_name = u["name"] if kind == "epic" else ""
                epic_link = ""
                if kind in ("story", "spike") and par:
                    epic_link = plan["_index"][par]["name"]
                row += [epic_name, epic_link]
                # Only sub-tasks use Parent ID here; a story reaches its epic by link.
                row += [issue_id(par) if kind == "subtask" and par else ""]
            else:
                row += [issue_id(par) if par and kind in ("story", "subtask", "spike") else ""]

            labels = _labels(u, cfg)
            row += labels + [""] * (max_labels - len(labels))
            links = blocks.get(u["_key"], [])
            row += links + [""] * (max_links - len(links))
            row += [cfg["fields"][f] for f in extra]
            w.writerow(row)
    return len(rows)


def _labels(unit, cfg):
    """Jira labels cannot contain whitespace — it silently splits them, or rejects
    the import. A screen group called "First run" is a legitimate label and a
    broken one, so it is hyphenated here rather than at every call site."""
    raw = list(cfg.get("labels", [])) + list(unit.get("labels", []))
    return sorted({"-".join(str(l).split()) for l in raw if str(l).strip()})


def to_json(plan, cfg, path):
    """The canonical record, and the only file worth diffing in review."""
    out = {"version": 1, "project": cfg["project"], "title": plan.get("title", ""),
           "summary": None, "units": []}
    parent = _parent_of(plan)
    for u in _rows(plan):
        out["units"].append({
            "key": u["_key"], "kind": u["_kind"], "id": u["_key"].split(":", 1)[1],
            "issue_id": issue_id(u["_key"]), "name": u["name"], "rank": u["_rank"],
            # The parent as a unit key, so anything reading this file can rebuild the
            # hierarchy without re-deriving it from the nesting in the plan.
            "parent": parent.get(u["_key"]),
            "blocked_by": u["_blocked_by"], "labels": _labels(u, cfg),
            **({"size": u["_size"]} if u["_kind"] == "story" else {}),
            "hash": content_hash(u), "description": describe(u, plan),
        })
    from plan import summarise
    out["summary"] = summarise(plan)
    Path(path).write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    return out


def to_markdown(plan, cfg, path):
    """What a person reads before any of this becomes real tickets."""
    L = [f"# {plan.get('title') or 'Backlog'}", "",
         f"`{cfg['project']['key']}` · {cfg['project']['style']}", "",
         "Generated. Read it before importing — the import is the irreversible half.", ""]
    from plan import summarise
    L += [summarise(plan), ""]

    spikes = sorted(plan.get("spikes", []), key=lambda s: s["_rank"])
    if spikes:
        L += ["## Answer these first", "",
              "Each one blocks work that is already written. Both options are live until somebody chooses.", ""]
        for k in spikes:
            blocked = [plan["_index"][b]["name"] for b in _blocked_by_spike(plan, k)]
            L += [f"### {k.get('question') or k['name']}", ""]
            if k.get("context"):
                L += [k["context"], ""]
            for o in k.get("options", []):
                L.append(f"- **{o.get('label','')}** — buys {o.get('buys','')}; costs {o.get('costs','')}; "
                         f"kills {o.get('kills','')}")
            if k.get("right_if"):
                L += ["", f"*{k['right_if']}*"]
            L += ["", f"Blocks: {', '.join(blocked) if blocked else 'nothing'}", ""]

    for e in sorted(plan.get("epics", []), key=lambda x: x["_rank"]):
        stories = [s for s in plan.get("stories", []) if s["epic"] == e["id"]]
        stories.sort(key=lambda s: s["_rank"])
        L += [f"## {e['name']}", ""]
        if e.get("intent"):
            L += [e["intent"], ""]
        for s in stories:
            flags = []
            if s.get("nothing_serves"):
                flags.append("nothing serves this yet")
            if s["_blocked_by"]:
                flags.append("blocked")
            head = f"### {s['name']}  ·  {s['_size']}" + (f"  ·  {', '.join(flags)}" if flags else "")
            L += [head, "", describe(s, plan), ""]
            for t in s.get("subtasks", []):
                L.append(f"- {t['name']}" + (f" — {t['body']}" if t.get("body") else ""))
            if s.get("subtasks"):
                L.append("")
    Path(path).write_text("\n".join(L).rstrip() + "\n")


def _blocked_by_spike(plan, spike):
    return [u["_key"] for u in _rows(plan) if spike["_key"] in u["_blocked_by"]]
