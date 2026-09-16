# The thinking-skill pairing

This is the one part of the pack that is **not** in the source procedure. It is a proposal.

The procedure's own standing rule says to run the designer skills and the thinking skills together —
a design skill tells you what good looks like in its own lane, a thinking skill catches what that
lane's answer breaks two screens away. But across six stages the procedure names exactly one thinking
skill, `thinking-systems`. Twenty-eight were available and unused.

The pairing below is my reading of which thinking skill each stage actually needs. It is embedded in
seven SKILL.md files, so it is tedious to unpick later. Argue with it now.

| Stage | Thinking skills | Why this one |
|---|---|---|
| 01 Frame | `thinking-jobs-to-be-done` · `thinking-pre-mortem` · `thinking-socratic` · `thinking-first-principles` · `thinking-circle-of-competence` · `thinking-cynefin` | "Name the worst thing this product can do" **is** a pre-mortem: assume it happened, reason backward. Socratic surfaces the brief's assumptions before you build on them. Circle-of-competence marks the claims you cannot verify. |
| 02 Structure | `thinking-systems` · `thinking-second-order` · `thinking-via-negativa` · `thinking-map-territory` | "Record what nothing serves" **is** via-negativa — the gap list is the removal. Map-territory names where the IA stops describing the product. `systems` is the one the procedure already had. |
| 03 Generate | `thinking-theory-of-constraints` · `thinking-reversibility` · `thinking-second-order` · `thinking-bounded-rationality` | Reversibility is the question behind "renaming is cheap in the UI and expensive in the record". Bounded-rationality sets the good-enough bar before polishing. |
| 04 Audit | `thinking-red-team` · `thinking-steel-manning` · `thinking-five-whys-plus` · `thinking-scientific-method` · `thinking-second-order` | Steel-manning is the missing half of "cut what reveals the machinery" — make the best case for the screen you are about to delete. Five-whys separates a finding's proximate cause from its systemic one. |
| · Decide | `thinking-kepner-tregoe` · `thinking-reversibility` | Kepner-Tregoe is decision analysis proper: weight the musts and the wants before the options are compared, so the trade-off text is not written to justify a choice already made. Reversibility sets how much evidence the answer is worth. |
| 05 Measure | `thinking-scientific-method` · `thinking-probabilistic` · `thinking-margin-of-safety` · `thinking-circle-of-competence` | A harness **is** the cheapest discriminating observation. Probabilistic stops "14 of 93" being read as a rate. Circle-of-competence is the written form of "a harness proves only the thing it looks at". |
| 06 Ship | `thinking-opportunity-cost` · `thinking-reversibility` · `thinking-map-territory` | What the handover format stops you doing later, and which names are now expensive to change. |

Ids are given in the collection-qualified form the library actually uses, so they can be copied
straight into a stage. When a stage's pairing does not fit the situation, use `thinking-model-router`
to pick instead. The router is vendored for exactly this.

## What this cost

Vendoring the pairing pulled in 22 thinking skills rather than the 1 the closure calculation produced.
That is scope beyond "named skills plus their stated companions" and it was added deliberately.
