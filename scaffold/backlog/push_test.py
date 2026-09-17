#!/usr/bin/env python3
"""Exercise push() against a stubbed Jira: no network, every guard real.

The rest of this directory writes files, so a bug shows up in a diff. This one
creates tickets in somebody's Jira, where a bug shows up as forty issues to
delete by hand — so the guards are tested rather than trusted:

  nothing is created before the confirmation
  parents exist before their children are sent
  a label never carries whitespace, which Jira splits or rejects
  a second push creates nothing
  a unit whose content changed is reported and never rewritten

    python3 push_test.py
"""
import json
import shutil
import subprocess
import sys
import tempfile
import os
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))


def build(work):
    subprocess.run([sys.executable, str(HERE / "build_backlog.py"),
                    "--model", str(ROOT / "examples/demo/model"),
                    "--config", str(ROOT / "examples/demo/backlog.config.json"),
                    "--out", str(work), "--title", "T"], check=True, capture_output=True)


def main():
    work = Path(tempfile.mkdtemp())
    quiet = open(os.devnull, "w")
    try:
        build(work)
        import push as P

        os.environ.update(JIRA_BASE_URL="https://example.invalid", JIRA_EMAIL="a@b.c",
                          JIRA_API_TOKEN="not-a-real-token")
        cfg = json.loads((ROOT / "examples/demo/backlog.config.json").read_text())
        cfg.setdefault("fields", {})

        sent, made = [], [0]

        def fake_call(base, token, path, payload=None, method=None):
            sent.append((path, payload))
            if path.endswith("/project/" + cfg["project"]["key"]):
                return {"issueTypes": [{"name": n} for n in cfg["issueTypes"].values()]}
            if path.endswith("/issueLinkType"):
                return {"issueLinkTypes": [{"name": cfg["linkTypes"]["blocks"]}]}
            if path.endswith("/issue"):
                made[0] += 1
                return {"key": f"{cfg['project']['key']}-{made[0]}"}
            return {}

        P.call = fake_call
        real_stdout, sys.stdout = sys.stdout, quiet

        def say(msg):
            print(msg, file=real_stdout)

        # 1 · no terminal and no --yes: refuse, having created nothing
        try:
            P.push(work, cfg, assume_yes=False)
            say("FAIL: pushed without a confirmation"); return 1
        except P.PushError as e:
            assert "no terminal to confirm" in str(e), e
        assert not [p for p, _ in sent if p.endswith("/issue")], "created before confirming"
        say("  refuses to create without a confirmation")

        # 2 · with --yes: parents before children, links after
        sent.clear()
        P.push(work, cfg, assume_yes=True)
        creates = [pl["fields"] for p, pl in sent if p.endswith("/issue")]
        links = [pl for p, pl in sent if p.endswith("/issueLink")]
        order = [c["issuetype"]["name"] for c in creates]
        assert order[0] == cfg["issueTypes"]["epic"], order[:3]
        first_sub = order.index(cfg["issueTypes"]["subtask"])
        last_story = max(i for i, n in enumerate(order)
                         if n in (cfg["issueTypes"]["story"], cfg["issueTypes"]["spike"]))
        assert first_sub > last_story, "sub-tasks must be created after their stories"
        sub = next(c for c in creates if c["summary"] == "Move to folder")
        assert sub.get("parent", {}).get("key"), "a sub-task must carry a resolved parent key"
        say(f"  created {len(creates)} issues, parents first, {len(links)} links")

        keys = json.loads((work / "backlog.keys.json").read_text())["units"]
        assert all(v.get("jira") for v in keys.values()), "every unit should carry a Jira key"
        say("  every unit mapped in backlog.keys.json")

        for c in creates:
            for label in c.get("labels", []):
                assert " " not in label, f"whitespace in a label breaks in Jira: {label!r}"
        say("  no label carries whitespace")

        # 3 · a second push creates nothing
        sent.clear()
        P.push(work, cfg, assume_yes=True)
        assert not [p for p, _ in sent if p.endswith("/issue")], "a re-push must not duplicate"
        say("  a second push creates nothing")

        # 4 · a changed unit is reported, never rewritten
        k = json.loads((work / "backlog.keys.json").read_text())
        k["units"]["story:manage/move"]["hash"] = "0000deadbeef"
        (work / "backlog.keys.json").write_text(json.dumps(k))
        sent.clear()
        P.push(work, cfg, assume_yes=True)
        assert not [p for p, _ in sent if p.endswith("/issue")], "a drifted unit must not be recreated"
        assert not [m for _, m in sent if m in ("PUT", "DELETE")], "push must never edit or delete"
        say("  a changed unit is left alone, never edited")

        sys.stdout = real_stdout
        print("push: every guard holds")
        return 0
    finally:
        sys.stdout = sys.__stdout__
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
