# Starter discussion threads

Not part of the pack — paste these into Discussions after enabling it (Settings → General →
Features → Discussions), then delete this file or leave it as a record of what was seeded and when.

---

## Thread 1 — category: **Q&A** (pin this one)

**Title:** Start here — Issues vs. Discussions

**Body:**

Short version: if the gate refused when it shouldn't have, or a harness reported something wrong,
that's an [issue](../../issues/new/choose) — the templates ask for the exact input that reproduces it.

Everything else lives here:

- Built an adapter for a stack that isn't Python or Node? Post it in **Show and tell**.
- Have a harness idea that isn't in `scaffold/harnesses/` yet? Post it in **Ideas**.
- Not sure if something is a bug or you're holding it wrong? Ask here in **Q&A** — that's what it's for.

Before asking, `AGENTS.md` and `scaffold/measured-design-contract/SKILL.md` answer more questions than
you'd expect, since the contract is deliberately short.

---

## Thread 2 — category: **Show and tell**

**Title:** Show your adapter

`scaffold/adapters/python/` and `scaffold/adapters/node/` are the two reference generators right now —
same ten `examples/demo` screens, same rationale text, same gate and harness results, built two
completely different ways. That was the point: the build contract is `boards/<id>.html` plus the ten
`model/*.json` files, nothing else, and it shouldn't matter what generates them.

If you've built (or are building) a third one — Ruby, Go, Rust, Swift, a templating language, whatever
you reach for — post it here. Doesn't need to be finished. The interesting part is always the same
question: how did your language answer "the rationale lives in the generator, extracted at build time"
when it doesn't have Python's docstrings? The Node adapter answered it with a `/** */` comment and a
regex over its own source. There's more than one right answer to that.

---

## Thread 3 — category: **Ideas**

**Title:** Harness ideas — what would you add?

Thirteen harnesses right now, each printing one number for one property:
`overflow, contrast (light/dark), translucency, cellfit, structure, vocab, routes, links, density,
lang, target-size, motion`. Twelve run in any one pass — `routes` needs a declared route map,
`links` is its weaker stand-in when there isn't one. Three of those (`lang`, `target-size`, `motion`) were added specifically because
they were gaps in the original nine, and `lang.mjs` immediately caught a real one (see the demo's own
README).

What's still missing? A few candidates that didn't make the cut yet, not because they're bad ideas but
because nobody's written them:

- RTL layout — does anything break when the writing direction flips?
- Print stylesheet sanity, for the products that still have one
- Focus-order vs. visual order (tabindex walking left-to-right, top-to-bottom vs. what's actually in
  the DOM)
- Localized string length — a label that fits in English and truncates in German

Each one is a ~30-line file in `scaffold/harnesses/` that measures one thing and prints one number —
see `CONTRIBUTING.md` for the shape. Post your idea here even half-formed; "what would this actually
catch" is worth arguing about before someone writes it.
