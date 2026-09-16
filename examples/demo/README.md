# demo — six screens, end to end

Small enough to read in one sitting, complete enough that every part of the contract fires.

What is deliberately wrong in it, so you can see the reports work:

- `files-removed` is a place with no empty state. The gate reports it and does not stop.
- `manage/estimate` is a step nothing serves. It is recorded in `gaps.json`, keyed to the step.
- `d-001` is an open decision, stated as two options each carrying what it buys and what it kills.
- `share-failed` carries an `unagreed` flag: the scope document still calls that place Trash.
- `scope.md` is missing "Share a file" entirely. `drift.py` finds it.

Break something on purpose:

```sh
sed -i 's/"Move to folder…"/"Put in folder"/' model/routes.json
python3 ../../scaffold/gate.py --model model --boards boards   # STOP · 1 routes do not bind
```

That is the whole idea. The route map cannot lie to QA, because the build will not produce one that does.
