#!/usr/bin/env python3
"""Turn a plan into a reviewable backlog, and tell you what changed since last time.

    python3 build_backlog.py --plan backlog.plan.json
    python3 build_backlog.py --model model            # measured-design projects

Writes backlog.json, jira.csv and backlog.md, and keeps backlog.keys.json — the
map from a unit to the ticket it became. The map is what stops the second run
producing a second copy of the first run's backlog, which is the failure mode
that makes generated backlogs not worth having.

Nothing here creates a Jira issue. Import the CSV, or push it deliberately once
you have read backlog.md.
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import plan as planlib  # noqa: E402
from emit import load_config, to_csv, to_json, to_markdown, issue_id  # noqa: E402

KEYS = "backlog.keys.json"


def diff(units, keys_path: Path):
    """Added, changed, gone — against the last run.

    A unit whose wording changed keeps its ticket, because identity is structural.
    A unit that disappeared keeps its map entry if a real ticket was ever recorded
    against it: the plan can forget a story, Jira cannot, and somebody has to go
    and close it.
    """
    old = json.loads(keys_path.read_text())["units"] if keys_path.exists() else {}
    now = {u["key"]: u for u in units}

    added = [k for k in now if k not in old]
    changed = [k for k in now if k in old and old[k].get("hash") != now[k]["hash"]]
    gone = [k for k in old if k not in now and not old[k].get("gone")]

    merged = {}
    for k, u in now.items():
        merged[k] = {"issue_id": u["issue_id"], "summary": u["name"], "hash": u["hash"],
                     "jira": old.get(k, {}).get("jira")}
    for k in gone:
        if old[k].get("jira"):
            merged[k] = {**old[k], "gone": True}
    for k, v in old.items():
        if v.get("gone") and k not in merged:
            merged[k] = v

    return added, changed, gone, merged


def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--plan", help="a backlog.plan.json written by any front end")
    src.add_argument("--model", help="a measured-design model/ directory")
    ap.add_argument("--config", default="backlog.config.json")
    ap.add_argument("--out", default=".")
    ap.add_argument("--title", default=None)
    ap.add_argument("--push", action="store_true",
                    help="after emitting, create the missing issues in Jira (asks first)")
    ap.add_argument("--dry-run", action="store_true",
                    help="with --push: show exactly what would be created, send nothing")
    ap.add_argument("--yes", action="store_true",
                    help="with --push: skip the confirmation. Required when there is no terminal.")
    a = ap.parse_args()

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    cfg = load_config(a.config)

    if not Path(a.config).exists():
        print(f"no {a.config} — using placeholder Jira settings.")
        print("  The project key, the project style and the issue type names differ per instance")
        print("  and cannot be guessed. Write one before importing, or the import will be rejected.\n")

    try:
        if a.model:
            from from_model import build
            p = planlib.resolve(build(Path(a.model), title=a.title))
        else:
            p = planlib.load(Path(a.plan))
    except planlib.PlanError as e:
        print(f"STOP · {e}")
        sys.exit(1)

    if a.title:
        p["title"] = a.title

    n = to_csv(p, cfg, out / "jira.csv")
    doc = to_json(p, cfg, out / "backlog.json")
    to_markdown(p, cfg, out / "backlog.md")

    keys_path = out / KEYS
    added, changed, gone, merged = diff(doc["units"], keys_path)
    keys_path.write_text(json.dumps(
        {"version": 1, "mappedAt": date.today().isoformat(), "units": merged},
        indent=2, ensure_ascii=False) + "\n")

    print(planlib.summarise(p))
    print(f"{n} rows · wrote backlog.json, jira.csv, backlog.md, {KEYS}")

    if keys_path.exists() and (added or changed or gone):
        print()
        for k in added:
            print(f"  added    {issue_id(k)}  {merged[k]['summary']}")
        for k in changed:
            print(f"  changed  {issue_id(k)}  {merged[k]['summary']}")
        for k in gone:
            mapped = merged.get(k, {}).get("jira")
            print(f"  gone     {issue_id(k)}  {mapped or 'never imported'}"
                  + ("  — close it by hand" if mapped else ""))

    blocked = [u for u in doc["units"] if u["blocked_by"]]
    spikes = [u for u in doc["units"] if u["kind"] == "spike"]
    if spikes:
        print(f"\n  {len(spikes)} unanswered decisions block {len(blocked)} items. "
              "They are emitted, not withheld — marked blocked, so the board shows the cost of not deciding.")

    if a.push or a.dry_run:
        # The only step here that reaches outside this directory. It is a separate
        # flag, it prints the whole plan, and it asks — because the file above can
        # be deleted and sixty tickets somebody has started working in cannot.
        from push import push, PushError
        try:
            return push(out, cfg, dry_run=a.dry_run, assume_yes=a.yes)
        except PushError as e:
            print(f"\n  STOP · {e}\n")
            sys.exit(1)
    elif doc["units"]:
        print(f"\n  Read backlog.md, then import jira.csv — or create them directly:\n"
              f"    python3 {Path(__file__).name} {'--model ' + a.model if a.model else '--plan ' + a.plan} --push --dry-run")


if __name__ == "__main__":
    main()
