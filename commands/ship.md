---
description: Produce one navigable artifact that answers five questions about any screen, with a happy-path switch, a failure register, and flagged unagreed claims.
argument-hint: "[what is being handed over]"
---
# /ship
Stage 06. Use `measured-design-ship`.

## Steps
1. Build the viewer from `model/index.json` — `scaffold/viewer/build_viewer.py`.
2. Check it answers all five questions for every screen.
3. Flag every claim the scope document has not seen, on the screen that makes it.
4. Confirm it opens from disk with the network refused.
5. Run `/drift` and bring the scope document level.

## Output
One self-contained artifact, and the list of edits the scope document needs.
