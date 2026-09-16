#!/usr/bin/env python3
"""Build the handover artifact: one self-contained HTML file, no dependencies.

Reads model/index.json and boards/*.html, emits a navigable document that answers
five questions about any screen without asking a designer — what kind of thing it
is, where it sits in the agreed scope, why it is like this, what leads here and
away, and what it is made of.

There is no offline build because there is nothing to inline. A viewer with a CDN
dependency is useless on a plane and in five years, and a hand-made offline copy
goes stale the moment the prototype changes.

    python3 build_viewer.py --model model --boards boards --out prototype.html
"""
import argparse, json, html
from pathlib import Path

SHELL = Path(__file__).with_name("shell.html")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="model")
    ap.add_argument("--boards", default="boards")
    ap.add_argument("--out", default="prototype.html")
    ap.add_argument("--title", default="Prototype")
    a = ap.parse_args()

    index_path = Path(a.model) / "index.json"
    if not index_path.exists():
        raise SystemExit("model/index.json is missing — the gate refused, or has not run.")
    index = json.loads(index_path.read_text())

    boards = {}
    for p in sorted(Path(a.boards).glob("*.html")):
        boards[p.stem] = p.read_text().replace("</script>", "<\\/script>")

    parts = []
    for sid, markup in boards.items():
        parts.append(f'<script type="text/plain" data-board="{html.escape(sid)}">{markup}</script>')

    shell = SHELL.read_text()
    out = (shell
           .replace("__TITLE__", html.escape(a.title))
           .replace("__DATA__", json.dumps(index).replace("</", "<\\/"))
           .replace("__BOARDS__", "\n".join(parts)))
    Path(a.out).write_text(out)
    kb = len(out) // 1024
    print(f"{len(boards)} boards · {len(index['screens'])} screens · {kb} KB · wrote {a.out}")


if __name__ == "__main__":
    main()
