# The thinking-skill pairing

This is the one part of the pack that is **not** in the source procedure. It is a proposal.

The procedure's own standing rule says to run the designer skills and the thinking skills together —
a design skill tells you what good looks like in its own lane, a thinking skill catches what that
lane's answer breaks two screens away. But across six stages the procedure names exactly one thinking
skill, `thinking-systems`. Twenty-eight were available and unused.

The pairing below is my reading of which thinking skill each stage actually needs. It is embedded in
six SKILL.md files, so it is tedious to unpick later. Argue with it now.

| Stage | Thinking skills | Why this one |
|---|---|---|
| 01 Frame | `jobs-to-be-done` · `pre-mortem` · `socratic` · `first-principles` · `circle-of-competence` | "Name the worst thing this product can do" **is** a pre-mortem: assume it happened, reason backward. Socratic surfaces the brief's assumptions before you build on them. Circle-of-competence marks the claims you cannot verify. |
| 02 Structure | `systems` · `second-order` · `via-negativa` · `map-territory` | "Record what nothing serves" **is** via-negativa — the gap list is the removal. Map-territory names where the IA stops describing the product. `systems` is the one the procedure already had. |
| 03 Generate | `theory-of-constraints` · `reversibility` · `second-order` · `bounded-rationality` | Reversibility is the question behind "renaming is cheap in the UI and expensive in the record". Bounded-rationality sets the good-enough bar before polishing. |
| 04 Audit | `red-team` · `steel-manning` · `five-whys-plus` · `scientific-method` | Steel-manning is the missing half of "cut what reveals the machinery" — make the best case for the screen you are about to delete. Five-whys separates a finding's proximate cause from its systemic one. |
| 05 Measure | `scientific-method` · `probabilistic` · `margin-of-safety` · `circle-of-competence` | A harness **is** the cheapest discriminating observation. Probabilistic stops "14 of 93" being read as a rate. Circle-of-competence is the written form of "a harness proves only the thing it looks at". |
| 06 Ship | `opportunity-cost` · `reversibility` · `map-territory` | What the handover format stops you doing later, and which names are now expensive to change. |

When a stage's pairing does not fit the situation, use `thinking-model-router` to pick instead. The
router is vendored for exactly this.

## What this cost

Vendoring the pairing pulled in 22 thinking skills rather than the 1 the closure calculation produced.
That is scope beyond "named skills plus their stated companions" and it was added deliberately.
