# demo — ten screens, end to end

Small enough to read in one sitting, complete enough that every part of the contract fires — four
journeys, two failure states, two open decisions, one place the audit forgot to give an empty state,
and a jargon zone that actually gets used.

What is deliberately wrong in it, so you can see the reports work:

- `files-removed` and `settings-storage` are places with no empty state. The gate reports both and
  does not stop. That count grew from one to two as the demo grew — it is supposed to; nothing here
  ever goes back and adds the missing state for you.
- `manage/estimate` is a step nothing serves. It is recorded in `gaps.json`, keyed to the step.
- `d-001` and `d-002` are open decisions, each stated as two options carrying what it buys and what
  it kills, not as a recommendation.
- `share-failed` carries an `unagreed` flag: the scope document still calls that place Trash.
- `sync-failed` and `search-empty` serve no journey step — they are system-reached branches an audit
  produced, not something anyone asked for by name. `drift.py` flags them as claims to confirm.
- `scope.md` is missing "Share a file" entirely. `drift.py` finds it.
- `settings-storage` is the one screen `policy.json` zones "advanced" — it is the only place `chunk`
  is allowed to appear. `vocab.mjs` enforces that, not a comment.

What the harnesses actually caught here, not staged: `lang.mjs` reported all ten boards with no
`<html lang>` the first time this demo was rebuilt with the current adapters — real, not planted. It
was a one-line fix in both `system.py` and `system.mjs`, and the count went to zero on the next build.
That is the loop the whole pack is for: a number, a fix, the same number checked again.

Break something on purpose:

```sh
sed -i 's/"Move to folder…"/"Put in folder"/' model/routes.json
python3 ../../scaffold/gate.py --model model --boards boards   # STOP · 1 routes do not bind
```

That is the whole idea. The route map cannot lie to QA, because the build will not produce one that does.

## The baseline is real too

`measured-design.baseline.json` here holds two findings, both genuine: the two lines of prose on
`files-move` run past 40em at 1440. They are recorded rather than fixed, which is the honest state of
this demo and the normal state of any codebase that existed before the checks did.

```sh
npx measured-design check --no-new    # 2 baselined · 0 new — exits 0
```

Break a board and the ratchet refuses where the gate would not care:

```sh
sed -i 's/<html lang="en">/<html>/' boards/files-list.html
npx measured-design check --no-new    # 2 baselined · 1 new — exits 1
git checkout boards/
```

The two known findings stay quiet. The new one does not. That is the difference between a number you
looked at once and a number that can only go down.
