---
description: Build the design system in code and compile every screen, with the rationale in the docstring.
argument-hint: "[feature area to generate]"
---
# /generate
Stage 03. Use `measured-design-generate`.

## Steps
1. Tokens, stylesheet, icons, shell — both themes at token level — before any screen.
2. One function per screen returning a string. Varying data as arguments.
3. Rationale in the docstring: context, options, why, trade-off, right-if. Extract it at build time.
4. The moment two screens do the same thing, make it a component.
5. Draw the failure cases. They now cost the same as the happy ones.
6. Run the gate. It refuses on a route that does not bind.

## Output
`boards/<id>.html` for every screen, `model/rationale.json`, a passing gate.
