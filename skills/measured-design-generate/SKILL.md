---
name: measured-design-generate
description: Stage 03 of measured-design. Compile screens instead of drawing them — one design system in code, one function per screen, rationale in the docstring, components the moment two screens do the same thing. Use when building screens, when screens have drifted apart, or when asked how to structure a prototype so it cannot rot.
---
# 03 · Generate the screens — never hand-author them

**Output:** every screen as build output, from one design system in code.

This is the part most teams skip, and it is the part that makes everything after it possible.
**Screens are compiled, not drawn.** A design tool gives you 93 files that drift; a generator gives
you 93 files that cannot.

Any stack satisfies the contract. `scaffold/adapters/python/` is the reference adapter; it is one
adapter, not the requirement. What is fixed is in `measured-design-contract`.

## The shape

```
design system in code   tokens · stylesheet · icons · shell · nav — everything imports from it
        ↓
one function per screen returns a string; varying data as arguments; docstring is the rationale
        ↓
boards/<id>.html        build output, never edited
        ↓
model/*.json            structure and meaning, kept by hand
        ↓
gate → index.json → viewer + harnesses
```

## Tokens before any screen

Colour, space, radius, type. **Both themes defined at token level from the start** — retrofitting
dark mode means auditing every screen twice. One function per icon. One shell function every screen
calls, so the window chrome is identical by construction rather than by discipline.

## The single highest-value habit

Put the rationale in the function's docstring and extract it at build time into `model/rationale.json`.
The reasoning then physically cannot drift from the screen, because they are the same object. A
reviewer is never looking at a screen without knowing why it is like that, and you never maintain a
separate rationale document that goes stale in a fortnight.

Docstring shape: context, options considered, why this one, the trade-off, and what would make a
different answer right.

## Write components, not screens

The moment two screens do the same thing, that thing becomes a function. This is not DRY for its own
sake — it is how a decision gets made once.

> Swarm Desktop: `empty_state(glyph, heading, line, actions, foot)` answers the same three questions
> on all seven empty places — where you are, what this place is for, and the one action that fills it.
> `door(…)` is the shape of every irreversible confirmation: consequence, an explicit *what this will
> not do* list, the precondition, and one destructive action. `who_cell(who)` is the access language
> in one place, which is why "Only you" is plain grey text on all 93 boards and not a chip on some.

A screen is now cheap enough that drawing the failure case costs the same as drawing the happy one —
which is the actual reason most products have no failure screens.

## Five traps, each of which cost real time

1. **Never bulk-edit copy with a regex across generators.** A scripted rewrite matched across string
   concatenation boundaries and swallowed closing quotes, `</p>` tags and triple-quote terminators.
   Five files damaged, some silently; the repair took longer than the rewrite. Change copy one string
   at a time with an exact-match assertion, and add a malformed-markup sweep to verification.
2. **Duplicate dictionary keys are a silent data-loss bug.** Python keeps the last of a duplicate key
   and drops the rest without a word. Appending an entry below an existing one had been deleting the
   existing one for months. A dict cannot be asked about this after the fact — the check must read
   the source text.
3. **A harness proves only the thing it looks at.** When a bug gets through, ask which harness
   *should* have caught it and why it structurally could not.
4. **A design-system inconsistency shows up as a false quality result.** One screen dimmed its
   background with a hand-rolled div instead of the system's scrim class; the contrast harness
   excluded scrims by class name, measured the wrong thing, and reported 3.58:1. The real finding was
   not the contrast — it was the screen that had gone off-system.
5. **Renaming is cheap in the UI and expensive in the record.** Rename the **id** too, not only the
   label. The id is the name engineers put in tickets, and leaving the old one reintroduces the lie
   exactly where it will be read most.

## Skills to invoke

Design:
- `design-systems-design-token` — every colour and space from one place
- `design-systems-create-component` / `design-systems-component-spec` — props, states, variants, accessibility
- `ui-design-color-system`, `ui-design-typography-scale`, `ui-design-dark-mode-design`
- `ui-design-design-screen` — layout from requirements
- `interaction-design-gesture-patterns` — drag, drop and context menus: the unbuttoned half
- `interaction-design-error-flow`, `interaction-design-loading-states`, `interaction-design-form-design`
- `designer-toolkit-ux-writing` — when the words are the deliverable
- `designer-toolkit-design-rationale` — the docstring: context, options, why, trade-off, right-if

Thinking, run alongside:
- `thinking-theory-of-constraints` — which one thing is actually limiting screen throughput
- `thinking-reversibility` — which of these choices is expensive to undo later
- `thinking-second-order` — what a component decision forces on the screens that adopt it
- `thinking-bounded-rationality` — set the good-enough bar for a screen before you start polishing

## Stop condition

The build is deterministic: re-running produces byte-identical files. Every screen has a rationale.
No hand-edited board exists. The gate passes. Not before.
