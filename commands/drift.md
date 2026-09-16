---
description: Compare the agreed scope document against the design model and report where they have drifted.
argument-hint: "[path to the scope document]"
---
# /drift
Use `measured-design-drift`. Run `scaffold/drift.py <scope-file>`.

## Steps
1. Point it at a local Markdown, HTML or text file. If the scope lives in a connector, fetch and save it first.
2. Read the five comparisons: verbatim step names, near-matches, steps nothing serves, screens nothing asks for, labels changed without ids.
3. Near-matches are worse than misses. Somebody paraphrased, and two names now exist for one thing.
4. Bring the scope document level with the audited prototype, not the other way round.
5. Flag every unagreed claim on the screen that makes it.

## Output
A drift report, a set of edits to the scope document, and a set of screens needing a gate flag.
