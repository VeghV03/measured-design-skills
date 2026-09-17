#!/usr/bin/env python3
"""measured-design `model/` → the shared plan.

This is the front end with the most to work with, and it is still only a front
end: everything it knows is turned into the same plan a brief or a crawl
produces, and the emitter never learns which one it got.

What the model already answers, so nothing here has to invent it:

    journeys.json   the epics, and the ordered steps inside them
    routes.json     what leads to what, and by click, gesture or system
    screens.json    kind, parent, group, whether a state is an empty case
    gaps.json       a step the scope asks for that nothing serves
    decisions.json  the open questions, and which screens they touch
    failures.json   the clause under which a screen is a failure
    rationale.json  why each screen is the way it is, extracted at build time

The one thing it does not answer is the "so I can" of a job story, and rather
than generating a plausible sentence, that is taken from the Why clause of the
screen's own rationale — or left for a person, and named as missing.
"""
import json
import re
from pathlib import Path

CLAUSES = ("Context", "Options", "Why", "Trade-off", "Right if")


def _read(d: Path, name, default=None):
    p = d / f"{name}.json"
    if not p.exists():
        if default is None:
            raise SystemExit(f"model/{name}.json is missing — backlog needs it.")
        return default
    return json.loads(p.read_text())


def _clause(text, want):
    """Rationale is one line of labelled clauses. Pull one out without a parser."""
    if not text:
        return ""
    parts = re.split(r"\b(" + "|".join(CLAUSES) + r"):\s*", text)
    for i in range(1, len(parts) - 1, 2):
        if parts[i] == want:
            return parts[i + 1].strip().rstrip(".")
    return ""


def build(model: Path, title=None) -> dict:
    screens = {s["id"]: s for s in _read(model, "screens")}
    journeys = _read(model, "journeys")
    routes = _read(model, "routes")
    gaps = _read(model, "gaps", {})
    decisions = _read(model, "decisions", [])
    failures = _read(model, "failures", {})
    rationale = _read(model, "rationale", {})
    policy = _read(model, "policy", {})

    # Which story owns a screen. A screen serving no step is not dropped; it is
    # attached below to the story it is actually reached from.
    owner, steps = {}, []
    for j in journeys:
        for st in j["steps"]:
            sid = f"{j['id']}/{st['id']}"
            steps.append((j, st, sid))
            for scr in st.get("screens", []):
                owner[scr] = sid

    inbound = {}
    for r in routes:
        inbound.setdefault(r["to"], []).append(r)

    epics = [{"id": j["id"], "name": j["name"],
              "intent": "Steps: " + ", ".join(s["name"] for s in j["steps"]) + ".",
              "labels": [j["id"]]}
             for j in journeys]

    stories = []
    for j, st, sid in steps:
        scr_ids = list(st.get("screens", []))
        primary = scr_ids[0] if scr_ids else None
        gap = gaps.get(sid)

        stories.append({
            "id": sid,
            "epic": j["id"],
            "name": st["name"],
            "job": _job(st, primary, inbound, screens, rationale),
            "body": _body(primary, rationale, gap),
            "criteria": _criteria(scr_ids, screens, failures, policy, gap),
            "subtasks": [_subtask(s, screens, rationale, failures) for s in scr_ids],
            "blocked_by": [],
            "notes": _notes(scr_ids, screens),
            "labels": [j["id"]],
            "nothing_serves": bool(gap) or not scr_ids,
        })

    by_id = {s["id"]: s for s in stories}

    # A screen the journeys never mention is still real and still has to be built.
    # It joins the story it is reached from, so it lands next to the work it
    # belongs with rather than in an "unmapped" bucket nobody grooms.
    for scr, s in screens.items():
        if scr in owner:
            continue
        src = next((r["from"] for r in inbound.get(scr, [])
                    if r.get("from") and r["from"] in owner), None)
        if not src:
            continue
        home = owner[src]
        t = _subtask(scr, screens, rationale, failures)
        t["body"] = (t.get("body", "") + f" Serves no named step; reached from {screens[src]['title']}.").strip()
        by_id[home]["subtasks"].append(t)
        by_id[home]["notes"].append(
            f"{s['title']} serves no step in the agreed scope. It is reached from this story, so it is "
            "built here — confirm the scope should name it.")

    _block(stories, by_id, screens, owner, journeys, routes)
    spikes = _spikes(decisions, owner)

    return {"version": 1, "title": title or "Backlog",
            "epics": epics, "stories": stories, "spikes": spikes}




def _job(st, primary, inbound, screens, rationale):
    """When / want / so. The first two are structural; the third is a design intent
    and is taken from the screen's own Why rather than written fresh here."""
    when = ""
    for r in inbound.get(primary, []) if primary else []:
        src = r.get("from")
        if not src or src not in screens:
            continue
        if r.get("via") == "click" and r.get("label"):
            when = f"I am in {screens[src]['title']} and choose {r['label']}"
        elif r.get("via") == "gesture" and r.get("gesture"):
            when = f"I {r['gesture']} in {screens[src]['title']}"
        else:
            when = f"{screens[src]['title']} reports it"
        break
    want = st["name"][0].lower() + st["name"][1:]
    # `so` is deliberately not filled from the rationale. The Why clause says why a
    # screen is shaped the way it is; the "so I can" says what the person walks away
    # with. They are different claims, and the model only holds the first — so it
    # goes in the body under its own heading and the slot is left visibly blank.
    return {"when": when, "want": want, "so": ""}


def _body(primary, rationale, gap):
    if gap:
        return gap
    text = rationale.get(primary, "")
    out = []
    for label, clause in (("Context", "Context"), ("Why the design is like this", "Why"),
                          ("Trade-off accepted", "Trade-off")):
        got = _clause(text, clause)
        if got:
            out.append(f"{label}: {got}.")
    return " ".join(out)


def _subtask(scr, screens, rationale, failures):
    s = screens[scr]
    body = _clause(rationale.get(scr, ""), "Context")
    if scr in failures:
        body = failures[scr]
    return {"id": scr, "name": s["title"], "body": body, "labels": [s.get("group", "")]
            if s.get("group") else []}


def _criteria(scr_ids, screens, failures, policy, gap):
    """One measurable line for the whole story, then only what this story
    specifically has to be true. Four identical harness lines on every ticket is
    the boilerplate this pack exists to avoid."""
    out = []
    if scr_ids:
        names = ", ".join(screens[s]["title"] for s in scr_ids)
        verb = "renders" if len(scr_ids) == 1 else "render"
        out.append({"text": f"{names} {verb} at every supported width with nothing off the frame, "
                            "a heading, labelled controls, targets at or over the minimum, and no text "
                            "under its contrast threshold in either theme",
                    "check": "overflow, structure, target-size, contrast"})
        out.append({"text": "every route declared from these screens binds to a label that is on the board",
                    "check": "routes"})
    if gap:
        out.append({"text": "something serves this step — a screen exists, is routed to, and is in the model"})
    for s in scr_ids:
        scr = screens[s]
        if s in failures:
            out.append({"text": f"{scr['title']} says what is still true, not only what failed: {failures[s]}"})
        if scr.get("empty_state"):
            out.append({"text": f"{scr['title']} says what to do next, not only that there is nothing here"})
        if scr.get("kind") == "place" and not any(
                o.get("parent") == s and o.get("empty_state") for o in screens.values()):
            out.append({"text": f"{scr['title']} has an empty state — an empty place is the most common "
                                "screen it will ever show"})
    if policy.get("terms") and scr_ids:
        out.append({"text": "no term the vocabulary policy forbids appears outside the zone that allows it",
                    "check": "vocab"})
    return out


def _notes(scr_ids, screens):
    return [f"{screens[s]['title']}: {screens[s]['unagreed']} The scope document has not seen this claim — "
            "bring it level before this ships."
            for s in scr_ids if screens[s].get("unagreed")]


def _block(stories, by_id, screens, owner, journeys, routes):
    """Only what genuinely cannot start.

    A state cannot be built before the place it hangs off. A journey cannot begin
    before there is a way into the product. Everything else the route graph knows
    is sequence, not a blocker — files-list leads to eight screens and blocking all
    eight on it produces a board nobody believes.
    """
    entrance = next((r["to"] for r in routes if r.get("from") is None), None)
    entrance_story = owner.get(entrance)

    for s in stories:
        deps = set()
        for scr in [t["id"] for t in s["subtasks"]]:
            parent = screens.get(scr, {}).get("parent")
            if parent and owner.get(parent) and owner[parent] != s["id"]:
                deps.add(owner[parent])
        s["blocked_by"] = sorted(deps)

    if entrance_story:
        for j in journeys:
            if not j["steps"]:
                continue
            first = f"{j['id']}/{j['steps'][0]['id']}"
            if first != entrance_story and first in by_id:
                deps = set(by_id[first]["blocked_by"]) | {entrance_story}
                by_id[first]["blocked_by"] = sorted(deps)


def _spikes(decisions, owner):
    """An open decision is not a note on a ticket. It is work, it has an owner, and
    until it is done both options are live — so it blocks what it touches.

    It also sits in the epic of the first thing it holds up, rather than floating
    loose at the root of the backlog where the people it blocks never see it."""
    out = []
    for d in decisions:
        if d.get("status") != "open":
            continue
        blocks = sorted({owner[s] for s in d.get("screens", []) if s in owner})
        epic = blocks[0].split("/")[0] if blocks else None
        out.append({
            **({"epic": epic} if epic else {}),
            # "Decide:" so the summary reads as work on a board, not as a question
            # somebody left in a comment.
            "id": d["id"], "name": "Decide: " + d["question"][0].lower() + d["question"][1:],
            "question": d["question"],
            "context": d.get("context", ""), "options": d.get("options", []),
            "right_if": d.get("right_if", ""), "blocks": blocks, "labels": ["decision"],
        })
    return out
