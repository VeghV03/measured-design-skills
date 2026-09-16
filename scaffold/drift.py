#!/usr/bin/env python3
"""Compare an agreed scope document against the design model.

Where the two disagree, the audited prototype dictates: the output is a set of
edits to the scope document, not to the model. Otherwise every audit finding is
optional.

A near-match is worse than a miss. A miss means the step is not in the scope; a
near-match means somebody paraphrased, and two names now exist for one thing.

    python3 drift.py docs/scope.md --model model

Markdown, HTML and plain text are handled here. If the scope lives in Confluence,
Notion or a ticket system, fetch it with whatever connector is available and save
it as a file first — you want a fixed thing to diff against next month.
"""
import argparse, difflib, html, json, re
from pathlib import Path


def plain(path: Path) -> str:
    t = path.read_text()
    if path.suffix.lower() in {".html", ".htm"}:
        t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", t, flags=re.S | re.I)
        t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
    return t


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scope")
    ap.add_argument("--model", default="model")
    a = ap.parse_args()
    M = Path(a.model)
    text = plain(Path(a.scope))
    lines = [l for l in (norm(x) for x in text.splitlines()) if l]
    blob = " \n ".join(lines)

    journeys = json.loads((M / "journeys.json").read_text())
    screens = json.loads((M / "screens.json").read_text())
    gaps = json.loads((M / "gaps.json").read_text())

    steps = [(j, st) for j in journeys for st in j["steps"]]
    verbatim, near, missing = [], [], []
    for j, st in steps:
        name = norm(st.get("name", st["id"]))
        if name in blob:
            verbatim.append(name)
            continue
        close = difflib.get_close_matches(name, lines, n=1, cutoff=0.72)
        (near if close else missing).append((f"{j['id']}/{st['id']}", st.get("name"), close[0] if close else None))

    unserved = [f"{j['id']}/{st['id']}" for j, st in steps if not st.get("screens")]
    served = {s for _, st in steps for s in st.get("screens", [])}
    orphans = [s["id"] for s in screens if s["id"] not in served]
    unagreed = [(s["id"], s["unagreed"]) for s in screens if s.get("unagreed")]

    print(f"scope: {a.scope} · model: {M}")
    print(f"  steps in scope, verbatim in journeys   {len(verbatim):>3} / {len(steps)}")
    print(f"  near-matches (somebody paraphrased)    {len(near):>3}")
    print(f"  steps not in the scope at all          {len(missing):>3}")
    print(f"  steps nothing serves                   {len(unserved):>3}  ({len(gaps)} recorded in gaps.json)")
    print(f"  screens serving no step                {len(orphans):>3}")
    print(f"  claims the scope has not seen          {len(unagreed):>3}")

    if near:
        print("\nnear-matches — two names now exist for one thing:")
        for sid, name, match in near:
            print(f'  {sid}: model says "{name}", scope says "{match}"')
    if missing:
        print("\nnot in the scope — bring the scope level, or drop the step:")
        for sid, name, _ in missing:
            print(f'  {sid}: "{name}"')
    if unserved:
        print("\nnothing serves these — the honest scope gap:")
        for sid in unserved:
            print(f"  {sid}{'  (recorded)' if sid in gaps else '  (NOT recorded in gaps.json)'}")
    if orphans:
        print("\nscreens serving no step — an audit produced them, so flag them as claims:")
        for sid in orphans:
            print(f"  {sid}")
    if unagreed:
        print("\nflag these on the screen that makes the claim:")
        for sid, why in unagreed:
            print(f"  {sid}: {why}")


if __name__ == "__main__":
    main()
