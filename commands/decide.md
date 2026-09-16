---
description: Turn an open question into a multiple-choice question with the trade-off on each option, and record it as a decision.
argument-hint: "[the open question]"
---
# /decide
Use `measured-design-decide`.

## Steps
1. Check the question is not already countable. If it is, run the check instead.
2. Write it in the owner's vocabulary, in one line.
3. Two to four options. Each with what it buys, what it costs, and what it kills.
4. State the right-if condition, so it can be re-opened later without re-arguing it.
5. Append to `model/decisions.json` with `status: open`.

## Output
One decision record, and a question someone can answer in two minutes.
