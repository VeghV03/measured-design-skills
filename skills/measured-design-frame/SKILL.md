---
name: measured-design-frame
description: Stage 01 of measured-design. Turn an ambiguous brief into a problem statement, a named audience with a frequency, the one worst outcome, and a checkable vocabulary policy. Use before drawing anything, or when a project has screens but nobody can say who it is for or what it must never do.
---
# 01 · Frame the problem before drawing anything

**Output:** a problem statement, the audience, the one worst outcome, and `model/policy.json`.

The first hour decides whether the next hundred are useful. Three questions, answered in words a
non-designer would use.

## 1 · Who is this for, exactly

Not a segment — a person with a frequency. "Someone who opens this every few weeks" and "someone who
lives in this all day" produce opposite products, and the difference shows up immediately in whether
the landing page is a dashboard or a teaching surface.

State the frequency explicitly. Then ask what it reverses: a frequency claim almost always
contradicts a line in the agreed scope, and that contradiction is the first useful finding.

> File manager: the persona was chosen on purpose, not technical. That decision reversed a line in
> the agreed canvas — the canvas said the first release has no Home screen, which is right for a
> product you live in and wrong for one you visit periodically. Home became a permanent landing page
> that teaches what you can do here, because a periodic visitor has forgotten.

## 2 · What is the worst thing this product can do

Name one. It becomes the tie-breaker for every later argument, and it earns disproportionate design
attention. One, not a list — a list is a way of not choosing.

> File manager: *a file reaches the wrong person.* Everything downstream followed. The address book
> was rebuilt around provenance, the share picker gained a duplicate-name warning, and the
> drag-into-folder screen exists almost entirely to carry one sentence — moving does not share —
> because every other file manager has taught people the opposite.

## 3 · What must never be said, and what must always be

Products built on unusual infrastructure have a vocabulary problem. Decide the policy once, in a form
that can be checked mechanically later. Write it into `model/policy.json` now, with zones — not a
loose note, or it will never be enforced.

> File manager policy: consequence in plain words, mechanism never. A person is told sharing cannot
> be taken back; they are never told about postage batches, chunks, ACT, feeds or dilution. Because
> the policy named a word list, it became a test — and the count outside Advanced went from 158 to 0.

## Skills to invoke

Design:
- `ux-strategy-frame-problem` — ambiguous brief into constraints and success criteria
- `ux-strategy-design-brief` — scope, audience, success criteria for this one project
- `design-research-user-persona` — a person with a frequency, not a segment
- `design-research-jobs-to-be-done` — what someone hired this product to do
- `ai-alignment-reasoning-harm-anticipation` — name the worst outcome before it is a bug report
- `ux-strategy-design-principles` — the rules that will settle later arguments

Thinking, run alongside:
- `thinking-jobs-to-be-done` — the progress being hired, under which circumstance
- `thinking-pre-mortem` — assume the worst outcome already happened; reason backward to its causes
- `thinking-socratic` — surface the assumptions in the brief before building on them
- `thinking-first-principles` — separate what the infrastructure forces from what convention assumes
- `thinking-circle-of-competence` — mark which claims in the brief you cannot actually verify

## Stop condition

You can state, in one sentence each: who this is for and how often they come back, the one worst
outcome, and which words are forbidden where. `model/policy.json` exists and parses. Not before.
