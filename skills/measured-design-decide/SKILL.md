---
name: measured-design-decide
description: Turn an open question only the product owner can settle into a multiple-choice question with the trade-off stated on each option, and record the answer as a decision. Use when an audit surfaces something you cannot decide, when a paragraph of asynchronous ambiguity is about to be written, or when a past decision needs a record.
---
# Force the open decision into multiple choice

When a question can only be settled by the person who owns the product, do not write a paragraph
asking about it. A paragraph gets read on a phone, gets a one-word reply, and answers nothing.

Write a multiple-choice question with the trade-off stated on each option. It converts a week of
asynchronous ambiguity into a two-minute answer, and the trade-off text means the answer is informed.

## The shape

- **The question** in one line, in the owner's vocabulary, not the design system's.
- **Two to four options.** Not more — more is a way of avoiding the recommendation.
- **Each option carries what it costs and what it buys.** An option with no stated cost is the one
  everybody picks, and it is the reason the question comes back.
- **What dies** if this option wins: the screen that gets cut, the promise that gets weakened.
- **Right-if:** the condition under which this option would be the correct answer. This is what makes
  a decision re-openable later without re-arguing it from scratch.

> The shape that works, from the file manager: *Keep the purchase wall, make the wait worth watching* —
> "Purchase stays first. Model the setup wait properly: what is happening, what you can do meanwhile,
> and returning to the exact file." Each option carried what it cost and what it bought. The answer
> produced two screens and closed a question the backlog had also asked independently.

## Record it

Append to `model/decisions.json`:

```json
{
  "id": "d-014",
  "question": "Does purchase stay ahead of first upload?",
  "context": "First-run audit: 3 screens assume a funded account.",
  "options": [
    { "label": "Keep the purchase wall",
      "buys": "no half-set-up state to design or support",
      "costs": "time to first value goes from seconds to minutes",
      "kills": "the try-before-you-fund entrance" },
    { "label": "Defer purchase until first upload",
      "buys": "a person sees the product before paying",
      "costs": "every screen needs an unfunded state",
      "kills": "the single linear first run" }
  ],
  "chosen": null,
  "right_if": "Defer wins if most arrivals are evaluating rather than migrating.",
  "status": "open",
  "screens": ["first-run-fund", "files-empty"]
}
```

`status` is `open` or `settled`. The gate reports open decisions on every build. An open decision is
not a failure — an *invisible* one is.

## Skills to invoke

Design:
- `designer-toolkit-design-negotiation` — when the answer is owned by someone who has to be persuaded
- `cross-functional-alignment-decision-log` — where the settled answer goes so it survives the author

Thinking, run alongside:
- `thinking-kepner-tregoe` — decision analysis: weight the musts and the wants before comparing
- `thinking-reversibility` — how cheap this is to undo sets how much evidence the answer needs

## Two rules

Never ask a question whose answer is already countable. Run the check instead; a question you could
have answered yourself spends the owner's attention and teaches them the questions are cheap.

Never bundle two decisions into one question. If the options differ in more than one dimension, it is
two questions, and the answer to the bundle cannot be acted on.

Thinking, run alongside: `thinking-opportunity-cost` for what each option forecloses,
`thinking-reversibility` for which option is expensive to undo, and `thinking-steel-manning` to make
the best case for the option you are about to argue against.
