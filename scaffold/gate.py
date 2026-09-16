#!/usr/bin/env python3
"""The build gate. Reads model/, checks what must be true, writes model/index.json.

Only two things stop the build: a declared click route whose label is not on its
source board, and a route pointing at a screen id that does not exist. A route map
that lies to QA is worse than a missing one.

Everything else prints a number. Adding a third refusing check is a decision with
a cost — every future contributor has to satisfy it before they can look at anything.

    python3 gate.py [--model model] [--boards boards]
"""
import argparse, json, re, sys, html
from pathlib import Path
from collections import Counter

FILES = ["screens", "journeys", "routes", "rationale", "decisions", "failures", "gaps", "policy"]
KINDS = {"place", "state", "detour", "entrance"}


def load(path: Path):
    """Parse, and separately check the raw text for duplicate keys.

    Python keeps the last of a duplicate key and drops the rest without a word.
    A dict cannot be asked about this after the fact, so read the source text.
    """
    text = path.read_text()
    dupes = []

    def hook(pairs):
        names = [k for k, _ in pairs]
        for k, n in Counter(names).items():
            if n > 1:
                dupes.append(f"{path.name}: key {k!r} appears {n} times")
        return dict(pairs)

    try:
        data = json.loads(text, object_pairs_hook=hook)
    except json.JSONDecodeError as e:
        return None, [f"{path.name}: {e}"]
    return data, dupes


def board_text(p: Path) -> str:
    s = p.read_text()
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="model")
    ap.add_argument("--boards", default="boards")
    a = ap.parse_args()
    M, B = Path(a.model), Path(a.boards)

    model, problems = {}, []
    for name in FILES:
        p = M / f"{name}.json"
        if not p.exists():
            problems.append(f"missing {p}")
            continue
        data, dupes = load(p)
        problems += dupes
        model[name] = data
    if problems:
        print("STOP · the model does not load")
        for p in problems:
            print("  " + p)
        sys.exit(1)

    screens = {s["id"]: s for s in model["screens"]}
    text = {p.stem: board_text(p) for p in B.glob("*.html")}

    # --- refusing checks -------------------------------------------------
    stop = []
    for s in screens:
        if s not in text:
            stop.append(f"screen {s} has no board at {B}/{s}.html")
    for r in model["routes"]:
        if r["to"] not in screens:
            stop.append(f"route {r.get('from')} → {r['to']} points at a screen that does not exist")
        via = r.get("via", "click")
        if via == "click":
            src = r.get("from")
            if src not in text:
                stop.append(f"route from {src} has no board")
            elif r.get("label", "") not in text[src]:
                stop.append(f'route "{r.get("label")}" is declared on {src} and is not on the board')
        elif via == "gesture" and not (r.get("gesture") or "").strip():
            stop.append(f"gesture route to {r['to']} has no gesture description")

    if stop:
        print(f"STOP · {len(stop)} routes do not bind. No prototype was written.")
        for s in stop:
            print("  " + s)
        sys.exit(1)

    # --- reporting checks ------------------------------------------------
    notes = []
    for s in model["screens"]:
        if s["kind"] not in KINDS:
            notes.append(f"{s['id']}: kind {s['kind']!r} is not one of {sorted(KINDS)}")
        if s["kind"] == "state":
            par = screens.get(s.get("parent"))
            if not par or par["kind"] != "place":
                notes.append(f"{s['id']}: a state whose parent is not a place")

    places = [s for s in model["screens"] if s["kind"] == "place"]
    empties = {s.get("parent") for s in model["screens"] if s.get("empty_state")}
    no_empty = [p["id"] for p in places if p["id"] not in empties]

    inbound = {r["to"] for r in model["routes"]}
    unreachable = [s for s in screens if s not in inbound]

    undrawn = [f"{j['id']}/{st['id']}" for j in model["journeys"] for st in j["steps"]
               if not st.get("screens") and f"{j['id']}/{st['id']}" not in model["gaps"]]

    open_decisions = [d["id"] for d in model["decisions"] if d.get("status") == "open"]
    no_rationale = [s for s in screens if s not in model["rationale"]]

    index = {
        "screens": model["screens"], "journeys": model["journeys"], "routes": model["routes"],
        "rationale": model["rationale"], "decisions": model["decisions"],
        "failures": model["failures"], "gaps": model["gaps"], "policy": model["policy"],
        "counts": {
            "screens": len(screens), "boards": len(text), "routes": len(model["routes"]),
            "places_without_an_empty_state": len(no_empty),
            "screens_with_no_inbound_route": len(unreachable),
            "steps_nothing_serves": len(undrawn),
            "open_decisions": len(open_decisions),
            "screens_without_rationale": len(no_rationale),
            "failure_states": len(model["failures"]),
            "recorded_gaps": len(model["gaps"]),
        },
        "reports": {
            "places_without_an_empty_state": no_empty,
            "screens_with_no_inbound_route": unreachable,
            "steps_nothing_serves": undrawn,
            "open_decisions": open_decisions,
            "screens_without_rationale": no_rationale,
            "model_notes": notes,
        },
    }
    (M / "index.json").write_text(json.dumps(index, indent=1))

    c = index["counts"]
    print(f"{c['routes']} routes declared, {c['routes']} bind, 0 dead")
    for k, v in c.items():
        if k != "routes":
            print(f"{v:>5}  {k.replace('_', ' ')}")
    for k, v in index["reports"].items():
        if v:
            print(f"  {k}: {', '.join(map(str, v[:8]))}{' …' if len(v) > 8 else ''}")
    print(f"\nwrote {M / 'index.json'}")


if __name__ == "__main__":
    main()
