#!/usr/bin/env python3
"""One function per screen. The docstring is the rationale, and it is extracted at
build time into model/rationale.json — so the reasoning physically cannot drift
from the screen, because they are the same object.

Screens are compiled, not drawn. Re-running produces byte-identical files, which
is how you check that what is published is still what is on disk.

    python3 build.py --boards ../../boards --model ../../model
"""
import argparse, inspect, json, sys
from pathlib import Path
from system import shell, empty_state, door, row, who_cell


def files_empty():
    """Context: seven places had no empty state, and an empty place is the most
    common screen any of them will ever show. Options: draw one per place, or one
    component. Why: one component makes the decision once. Trade-off: the copy has
    to be generic enough to fit all of them. Right if: the places are genuinely
    the same shape; when one is not, it gets its own screen, not a flag."""
    return shell("Files", empty_state(
        "folder", "Nothing here yet",
        "Files you add appear here. Only you can see them until you share one.",
        "Add a file", "Nothing is uploaded until you choose it."), "Files")


def files_list():
    """Context: the list is where a periodic visitor lands. Options: a dashboard of
    activity, or the files themselves. Why: a visitor has forgotten what this is
    for, and the files are the memory. Trade-off: no room for status. Right if:
    the audience visits every few weeks rather than living here."""
    body = ("<h1>Files</h1><p>Three files. Sharing cannot be taken back.</p>"
            + row("notes.md", "Only you", "12 KB")
            + row("budget-2026-final-v3.xlsx", "Shared with 2", "1.1 MB")
            + row("photo.jpg", "Only you", "840 KB")
            + '<p><button class="btn">Move to folder…</button> '
              '<button class="btn danger">Remove</button></p>')
    return shell("Files", body, "Files")


def files_move():
    """Context: every other file manager has taught people that moving a file into
    a shared folder shares it. Options: a silent move, or a screen carrying one
    sentence. Why: the worst outcome is a file reaching the wrong person, so the
    sentence earns a screen. Trade-off: one more step in a common action. Right if:
    the worst outcome stays what it is."""
    return shell("Move to folder", door(
        "Move budget-2026-final-v3.xlsx to Shared work",
        ["Moving does not share. Nobody gains access by this move.",
         "It does not change who can already see the file."],
        "The file stays where you can find it under Files.",
        "Move the file"), "Files")


def files_removed():
    """Context: every trash metaphor promises the item is gone and the space comes
    back. This product delivers neither, so the name was the lie. Options: keep
    Trash and explain, or rename. Why: the button says Remove, so the place is its
    past tense, and the verb and the noun agree. Trade-off: one unfamiliar word.
    Right if: the storage genuinely cannot be reclaimed."""
    return shell("Removed", empty_state(
        "file", "Nothing removed",
        "Files you remove stay here for 30 days. Removing does not free storage.",
        "Back to files"), "Removed")


def share_failed():
    """Context: a failure state is a screen where something was refused, timed out,
    ran out or cannot be done here. Options: a toast, or a screen. Why: the person
    needs to know what did not happen and what is still true. Trade-off: a screen
    to maintain. Right if: the failure is recoverable and the recovery is not
    obvious."""
    body = ("<h1>That share did not go out</h1>"
            "<p>We asked for it and it did not come back. Nobody was given access.</p>"
            '<p><button class="btn primary">Try again</button></p>')
    return shell("Share", body, "Shared")


def first_run():
    """Context: an entrance assumes no prior state. Options: start at the file list,
    or teach first. Why: a periodic visitor has forgotten what this is for.
    Trade-off: a screen between a returning person and their files. Right if: the
    audience opens this every few weeks rather than all day."""
    body = ("<h1>Your files, wherever you are</h1>"
            "<p>Add a file and it stays yours. Share one and it cannot be taken back.</p>"
            '<p><button class="btn primary">Add your first file</button></p>')
    return shell("Welcome", body, "")


SCREENS = {
    "first-run-welcome": first_run,
    "files-empty": files_empty,
    "files-list": files_list,
    "files-move": files_move,
    "files-removed": files_removed,
    "share-failed": share_failed,
}


def write(out: Path, name: str, markup: str):
    p = out / f"{name}.html"
    p.write_text(markup)
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--boards", default="boards")
    ap.add_argument("--model", default="model")
    a = ap.parse_args()
    out, mdl = Path(a.boards), Path(a.model)
    out.mkdir(parents=True, exist_ok=True)
    mdl.mkdir(parents=True, exist_ok=True)

    rationale = {}
    for name, fn in SCREENS.items():
        write(out, name, fn())
        doc = inspect.getdoc(fn)
        if not doc:
            print(f"  {name}: no docstring — that is the finding, not a warning", file=sys.stderr)
        rationale[name] = " ".join((doc or "").split())
    (mdl / "rationale.json").write_text(json.dumps(rationale, indent=1))
    print(f"{len(SCREENS)} boards written to {out} · rationale extracted to {mdl}/rationale.json")


if __name__ == "__main__":
    main()
