---
name: measured-design-audit
description: Stage 04 of measured-design. Run the audits as a stack rather than one at a time, red-team the product's own honesty, force open decisions into multiple choice with trade-offs, and cut screens that reveal the machinery. Use when a design needs reviewing, when findings need to name a file and a line, or when a decision keeps being deferred.
---
# 04 · Audit as a stack, and force the decisions out loud

**Output:** answered decisions in `model/decisions.json`, and findings that name a file and a line.

Run the audits as a **stack**, not one at a time. Findings from different lenses land on the same
screen and interact, and you want to see that before you fix anything. Fixing per-lens produces
changes that undo each other.

## The stack

- `inclusive-interaction-audit` — keyboard, targets, gesture alternatives, motion, feedback
- `design-systems-audit-system` — consistency and completeness of the system itself
- `designer-toolkit-design-token-audit` — hard-coded values that escaped the tokens
- `accessible-content-review` — headings, labels, link text, reading level
- `accessible-content-readable-content` — reading level and plain language, on the prose you shipped
- `adaptive-interfaces-information-density` — cognitive load at the real scale, not the demo scale
- `ux-strategy-information-architecture` — does the structure still hold
- `interaction-design-jakobs-law` — where you break convention, and whether it is worth it
- `interaction-design-onboarding-design` — first run and time to first value
- `ai-alignment-reasoning-red-team` — how does this mislead someone acting in good faith
- `visual-critique-critique-screen` — seven visual lenses on one rendered screen
- `visual-critique-critique-affordance`, `visual-critique-critique-typography`,
  `visual-critique-critique-information-density` — the individual lenses, when `critique-screen`
  flags one and you want it on its own
- `design-ops-design-critique` — running the review itself so it produces findings, not opinions
- `model-interaction-design-design-conversation` — who leads at each turn

Thinking, run alongside:
- `thinking-red-team` and `thinking-steel-manning` — attack it, then make the best case for what you
  were about to delete
- `thinking-five-whys-plus` — a finding's proximate cause is rarely its systemic one
- `thinking-scientific-method` — when two explanations fit a finding, run the cheapest discriminating check
- `thinking-second-order` — what the fix breaks two screens away

## Red-team your own honesty, not just your security

The useful question is not "can this be attacked" but **"where does this mislead someone who is
behaving reasonably?"** Those failures are far more common and nobody files them as bugs, because
each individual screen is defensible.

> Two findings this produced in the file manager. The word **Trash**: every trash metaphor in computing
> promises two things — the item is gone, and the space comes back. The product delivers neither. The
> name was the lie, so it became **Removed**; the button says "Remove", so the place is its past
> tense, and the verb and the noun now agree. And the phrase **"we opened them"** in a status line,
> which directly contradicted the product's own promise that it cannot read your files. Rewritten to
> "we asked for it and it came back" — which is also the only thing that is actually true, since
> nobody can observe a retrieval from outside.

## Force the open decisions into multiple choice

When an audit surfaces a question only the product owner can settle, do not write a paragraph asking
about it. Put it as a multiple-choice question with the trade-off stated on each option. It converts
a week of asynchronous ambiguity into a two-minute answer, and the trade-off text means the answer is
informed. Use `measured-design-decide`; it writes into `model/decisions.json`.

## Cut what reveals the machinery

Audits reliably find screens explaining *how* when the user only needs *what happens*. Cutting is
design work, not tidying.

> File manager: teaching clauses across the set went from 36 to 4, and the four that remain are at
> the exact points of consequence.

## Finding format

Every finding names a board id, an element or line, the count, and the thing to do. If you cannot
write the count, you have an opinion, not a finding — either build the check that produces the count
or drop it. Opinions still belong in the review; they just do not go in this list.

## Stop condition

Every lens in the stack has run against the built output. Every finding names a file and a count.
Every question only the owner can settle is an entry in `decisions.json` with status `open` and at
least two options carrying trade-offs. Not before.
