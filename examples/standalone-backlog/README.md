# standalone-backlog — a Jira structure with no `model/` anywhere

An invoicing product, planned from a two-page brief. No screens exist, no design system, no scope
document in the pack's format — this is the path for a project that has none of the rest of it.

```sh
python3 ../../scaffold/backlog/build_backlog.py --plan backlog.plan.json
```

`backlog.plan.json` is hand-written, the way `jira-backlog` writes one after reading a brief, crawling
a running app, or reading a router. It is the only thing the front end produces; everything after it
is the same emitter the measured-design path uses.

## What to look at

**The spike is the point.** The brief lists business detail fields and never says which are legally
required — which varies by country and is not fixable after invoices have gone out. That is not a note
in a description; it is `spike:tax-fields`, and it **blocks** `set-up/details`. The build order puts it
at rank 1, ahead of everything it holds up. A plan that buries that question inside a story is a plan
that discovers it in the second sprint.

**Two stories have no "so I can".** `set-up/bank` and `get-paid/chase` leave it empty, because the
brief does not say what the person gets. They emit as:

> When an invoice has gone past its due date, I want to remind the client without writing the email
> myself, so I can ⟨outcome — one line, from whoever knows why this step exists⟩.

The summary counts them. Filling that slot from context would produce a sentence that reads fine and
that nobody decided, and somebody would then build against it.

**One story has nothing serving it.** `get-paid/chase` is a line in the brief with nothing designed for
it. It is a story flagged `nothing_serves`, not a silent omission — the hole is in the backlog where
somebody will trip over it.

**The blockers are preconditions, not sequence.** You cannot connect a bank account before the business
exists; you cannot send an invoice before creating one. The click path between screens is not in there.

**The criteria say what must never happen.** Creating an invoice must not send anything; a failed bank
connection has to say no money moved. Those are the criteria worth writing — the ones that stop a
plausible implementation being the wrong one. Three of them name a check that proves them.

## The config

`backlog.config.json` here is **team-managed**, with no Spike issue type — decisions import as `Task`,
which is the common case. Compare it with `examples/demo/backlog.config.json`, which is
company-managed: the CSV comes out with different columns, because company-managed parents a story to
its epic through `Epic Link` and team-managed uses `Parent ID`. Getting that wrong imports every story
unparented while appearing to succeed, which is why the skill asks per project instead of assuming.
