---
description: Run the full audit stack against the built output, red-team the product's honesty, and force open questions into multiple choice.
argument-hint: "[what to audit — all boards, or a feature area]"
---
# /audit
Stage 04. Use `measured-design-audit`.

## Steps
1. Run the whole lens stack before fixing anything. Findings interact.
2. Ask where this misleads someone behaving reasonably — not whether it can be attacked.
3. Cut screens that explain *how* where the person only needs *what happens*.
4. Every finding names a board, an element and a count. No count, no finding.
5. Everything only the owner can settle goes through `/decide`.

## Output
A finding list with counts, and `model/decisions.json` with the open questions stated as choices.
