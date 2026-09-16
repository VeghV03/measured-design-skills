---
description: Check every board for forbidden words outside their permitted zone, per model/policy.json.
argument-hint: "[optional: a single board or zone]"
---
# /lint-vocab
Run `scaffold/harnesses/vocab.mjs`.

## Steps
1. Confirm `model/policy.json` has terms, zones and `scan.ignore_selectors`. A bare word list produces false findings.
2. Run the harness against `boards/`.
3. For each hit, decide: rewrite the copy, or widen the zone. Widening the zone is a decision — record it.
4. Report the count and the boards, never a bare total.

## Output
`N terms · M boards affected`, with the list.
