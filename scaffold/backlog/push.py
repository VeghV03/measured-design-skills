#!/usr/bin/env python3
"""Create the backlog in Jira. The irreversible half, kept deliberately separate.

Everything else in this directory writes files you can read, diff and throw away.
This makes real tickets that real people will see, so it works to three rules:

  It creates, it never edits.   A ticket that exists has a life of its own —
    comments, an assignee, edits somebody made on purpose. Re-pushing a changed
    story reports the difference and leaves the ticket alone. Overwriting a
    colleague's edits from a generator is not a sync, it is data loss.

  It writes the map down as it goes.   Every created key lands in
    backlog.keys.json immediately, not at the end. A run that dies halfway can be
    retried without producing a second copy of everything it already made.

  It asks first.   The plan is printed in full and confirmed before anything is
    sent, unless --yes. With no terminal to ask at, --yes is required.

Credentials come from the environment and are never written to a file, never
printed, and never stored in the repo:

    JIRA_BASE_URL   https://your-domain.atlassian.net
    JIRA_EMAIL      the account the tickets will be created as
    JIRA_API_TOKEN  from id.atlassian.com → Security → API tokens
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# v2 rather than v3: v3 requires the description as an Atlassian Document Format
# tree, and hand-building ADF to say a paragraph is a lot of machinery to get the
# same words on the screen. v2 takes the text and is still supported on Cloud.
API = "/rest/api/2"
ORDER = {"epic": 0, "spike": 1, "story": 1, "subtask": 2}


class PushError(Exception):
    pass


def credentials():
    missing = [k for k in ("JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN") if not os.environ.get(k)]
    if missing:
        raise PushError(
            "not set: " + ", ".join(missing) + "\n"
            "  Jira credentials are read from the environment, never from a file in the repo:\n"
            "    export JIRA_BASE_URL=https://your-domain.atlassian.net\n"
            "    export JIRA_EMAIL=you@example.com\n"
            "    export JIRA_API_TOKEN=...   # id.atlassian.com → Security → API tokens")
    base = os.environ["JIRA_BASE_URL"].rstrip("/")
    token = base64.b64encode(f"{os.environ['JIRA_EMAIL']}:{os.environ['JIRA_API_TOKEN']}".encode()).decode()
    return base, token


def call(base, token, path, payload=None, method=None):
    """One request, with a retry on the two failures that are worth retrying.

    429 and 5xx are the server asking for a moment. Everything else is this
    program being wrong, and retrying a wrong request just makes it wrong twice.
    """
    url = base + path
    body = json.dumps(payload).encode() if payload is not None else None
    for attempt in range(4):
        req = urllib.request.Request(url, data=body, method=method or ("POST" if body else "GET"))
        req.add_header("Authorization", f"Basic {token}")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                text = r.read().decode()
                return json.loads(text) if text.strip() else {}
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:600]
            if e.code in (429, 500, 502, 503, 504) and attempt < 3:
                wait = int(e.headers.get("Retry-After") or (2 ** attempt))
                print(f"    {e.code}, waiting {wait}s")
                time.sleep(wait)
                continue
            raise PushError(f"{method or 'POST'} {path} → {e.code}\n  {detail}")
        except urllib.error.URLError as e:
            raise PushError(f"cannot reach {base}: {e.reason}")
    raise PushError(f"{path}: gave up after 4 attempts")


def preflight(base, token, cfg):
    """Fail on the whole project, before creating a single ticket.

    A run that creates nine issues and then discovers the tenth type does not
    exist leaves somebody deleting nine issues by hand.
    """
    key = cfg["project"]["key"]
    try:
        proj = call(base, token, f"{API}/project/{key}")
    except PushError as e:
        raise PushError(f"project {key} is not readable with these credentials.\n  {e}")

    have = {t["name"] for t in proj.get("issueTypes", [])}
    want = {k: v for k, v in cfg["issueTypes"].items()}
    unknown = {k: v for k, v in want.items() if v not in have}
    if unknown:
        raise PushError(
            "these issue types do not exist in project " + key + ":\n"
            + "".join(f"    {k} → {v!r}\n" for k, v in unknown.items())
            + "  the project has: " + ", ".join(sorted(have)) + "\n"
            "  Fix issueTypes in backlog.config.json. Plenty of instances have no Spike type;\n"
            '  "spike": "Task" is the usual answer.')

    link = cfg["linkTypes"]["blocks"]
    names = {t["name"] for t in call(base, token, f"{API}/issueLinkType").get("issueLinkTypes", [])}
    if names and link not in names:
        raise PushError(f"link type {link!r} does not exist. This instance has: "
                        + ", ".join(sorted(names)))
    return proj


def _fields(unit, cfg, parent_key):
    f = {
        "project": {"key": cfg["project"]["key"]},
        "issuetype": {"name": cfg["issueTypes"][unit["kind"]]},
        "summary": unit["name"][:255],
        "description": unit["description"],
    }
    if unit.get("labels"):
        f["labels"] = unit["labels"]
    if parent_key:
        # Modern Jira Cloud parents every level — story under epic, sub-task under
        # story — with the same field. Older company-managed instances still want
        # the Epic Link custom field, so it stays configurable rather than assumed.
        if unit["kind"] in ("story", "spike") and cfg.get("epicLinkField"):
            f[cfg["epicLinkField"]] = parent_key
        else:
            f["parent"] = {"key": parent_key}
    if unit["kind"] == "epic" and cfg.get("epicNameField"):
        f[cfg["epicNameField"]] = unit["name"][:255]
    f.update(cfg.get("fields", {}))
    return f


def push(out: Path, cfg, dry_run=False, assume_yes=False):
    doc = json.loads((out / "backlog.json").read_text())
    keys_path = out / "backlog.keys.json"
    keys = json.loads(keys_path.read_text())

    units = {u["key"]: u for u in doc["units"]}
    mapped = {k: v["jira"] for k, v in keys["units"].items() if v.get("jira")}
    todo = [u for u in doc["units"] if u["key"] not in mapped]
    todo.sort(key=lambda u: (ORDER[u["kind"]], u["rank"]))

    # A mapped unit whose content moved is reported, never rewritten. The ticket
    # belongs to whoever has been working in it since.
    drifted = [k for k, v in keys["units"].items()
               if v.get("jira") and k in units and v.get("hash") != units[k]["hash"]]

    print(f"\n  {cfg['project']['key']} · {cfg['project']['style']} · {doc['summary']}")
    if mapped:
        print(f"  {len(mapped)} already in Jira — skipped, never edited")
    if drifted:
        print(f"\n  changed since they were pushed, left alone:")
        for k in drifted[:10]:
            print(f"    {mapped[k]}  {units[k]['name']}")
        print("    edit these in Jira by hand, or accept the ticket as it stands")
    if not todo:
        print("\n  nothing to create.\n")
        return 0

    print(f"\n  will create {len(todo)} issues:")
    for u in todo:
        print(f"    {cfg['issueTypes'][u['kind']]:<10} {u['name'][:66]}")
    links = sum(len(u["blocked_by"]) for u in doc["units"])
    print(f"  and {links} '{cfg['linkTypes']['blocks']}' links\n")

    if dry_run:
        print("  --dry-run: nothing was sent.\n")
        return 0

    base, token = credentials()
    print(f"  as {os.environ['JIRA_EMAIL']} on {base}")
    preflight(base, token, cfg)
    print("  project, issue types and link type all check out")

    if not assume_yes:
        if not sys.stdin.isatty():
            raise PushError("no terminal to confirm at. Re-run with --yes if you mean it.")
        if input("\n  Create these in Jira? This cannot be undone in bulk. [y/N] ").strip().lower() != "y":
            print("  nothing sent.\n")
            return 0

    def save():
        keys_path.write_text(json.dumps(keys, indent=2, ensure_ascii=False) + "\n")

    created = 0
    try:
        for u in todo:
            # Parents are created first — ORDER puts epics before stories before
            # sub-tasks — so by the time a child is sent its parent is in the map.
            parent_key = mapped.get(u.get("parent")) if u.get("parent") else None
            if u.get("parent") and not parent_key:
                raise PushError(f"{u['name']}: its parent {u['parent']} has no Jira key yet")
            res = call(base, token, f"{API}/issue", {"fields": _fields(u, cfg, parent_key)})
            key = res["key"]
            keys["units"].setdefault(u["key"], {}).update(
                {"issue_id": u["issue_id"], "summary": u["name"], "hash": u["hash"], "jira": key})
            mapped[u["key"]] = key
            save()                      # after each, so a retry never duplicates
            created += 1
            print(f"    {key:<12} {u['name'][:60]}")
    except PushError:
        save()
        print(f"\n  stopped after {created}. The keys so far are saved — re-run to continue,\n"
              "  and it will create only what is still missing.\n")
        raise

    made = 0
    for u in doc["units"]:
        for dep in u["blocked_by"]:
            if u["key"] in mapped and dep in mapped:
                try:
                    call(base, token, f"{API}/issueLink", {
                        "type": {"name": cfg["linkTypes"]["blocks"]},
                        "inwardIssue": {"key": mapped[u["key"]]},    # is blocked by
                        "outwardIssue": {"key": mapped[dep]},        # blocks
                    })
                    made += 1
                except PushError as e:
                    print(f"    link {mapped[dep]} → {mapped[u['key']]} failed: {e}")
    save()
    print(f"\n  created {created} issues and {made} links.")
    print(f"  {keys_path.name} now maps every unit to its ticket — the next run creates only what is new.\n")
    return 0
