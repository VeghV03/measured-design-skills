---
name: measured-design-drift
description: Compare an agreed scope document against the design model and report where they have drifted — steps nothing serves, screens making claims the scope has not seen, and names that differ. Use before a handover, after an audit changes something, or whenever a scope document and a prototype both exist.
---
# Keep the sources of truth level

Where a scope document and a prototype both exist, they drift, and drift is silent. This skill makes
the drift a list.

Where the two disagree, **the audited prototype dictates.** The scope document is brought level with
it, not the other way round — otherwise every audit finding is optional. The output of this skill is
therefore a set of edits to the scope document, plus a set of flags to put on screens.

## Input

A scope document as a local file — Markdown, HTML or plain text — or pasted text. `scaffold/drift.py`
handles those three. If the scope lives in Confluence, Notion or a ticket system, fetch it with
whatever connector is available and save it as a file first; the comparison logic does not change,
only the fetch does. Do not try to compare against a live page — you want a fixed thing to diff
against next month.

## What it compares

1. **Step names.** Every step in `model/journeys.json` should appear verbatim in the scope document.
   A near-match is worse than a miss: it means somebody paraphrased, and two names now exist for one
   thing. Report near-matches separately from misses.
2. **Steps nothing serves.** A heading or step in the scope with no screen against it. This is the
   honest scope gap and belongs in `model/gaps.json`.
3. **Screens nothing asks for.** A screen serving no step. Sometimes correct — an audit produced it —
   in which case it is an unagreed claim, not an error.
4. **Unagreed claims.** Anything the prototype asserts that the scope has not seen: a renamed thing,
   a new screen, a reversed decision. Each one gets flagged visibly on the screen that makes it, so
   nobody mistakes a proposal for an agreement.
5. **Ids versus labels.** Renaming is cheap in the UI and expensive in the record. If a label changed
   and the id did not, the old name still lives where engineers read it most — in tickets.

## Output

```
scope: docs/scope.md · model: model/
  steps in scope, verbatim in journeys     41 / 44
  near-matches (paraphrased)                2   → list
  steps nothing serves                      1   → gaps.json
  screens serving no step                   6   → 6 unagreed claims
  labels changed without the id              3   → list
```

Then: the edits to make to the scope document, and the screens that need a gate flag.

Thinking, run alongside: `thinking-map-territory` — both documents are maps, and the disagreement
tells you which one stopped describing the product.
