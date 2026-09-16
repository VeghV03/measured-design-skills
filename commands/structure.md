---
description: Model journeys verbatim from the scope, classify every screen as place, state, detour or entrance, and record what nothing serves.
argument-hint: "[path to the scope document]"
---
# /structure
Stage 02. Use `measured-design-structure`.

## Steps
1. Copy journeys and step names verbatim into `model/journeys.json`. Never paraphrase.
2. Classify every screen into `model/screens.json`. One kind each.
3. Record gesture and system routes in `model/routes.json` with the right `via`.
4. Write steps nothing serves into `model/gaps.json`, keyed to the step.
5. Run `thinking-via-negativa` over the result: what is absent that the scope asks for.

## Output
`journeys.json`, `screens.json`, `routes.json`, `gaps.json`.
