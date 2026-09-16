---
name: design-systems-create-component
description: Scaffold a full component specification end to end — props, states, variants, accessibility, and documentation.
license: MIT
disable-model-invocation: true
---
<!-- vendored into measured-design. upstream id: `design-systems:create-component` · source: designer-skills (MIT, MC Dean)
     invoked by the measured-design stage skills; see skills/library/INDEX.md -->

# /create-component
Generate a comprehensive component specification.
## Steps
1. **Research** — Understand purpose and common implementations.
2. **Anatomy** — Break down parts using `component-spec` skill.
3. **Variants** — Define size, style, layout variants.
4. **States** — Map interactive states using `component-spec` skill.
5. **Tokens** — Identify consumed tokens using `design-token` skill.
6. **Accessibility** — Specify ARIA, keyboard, screen reader using `accessibility-audit` skill.
7. **Naming** — Follow conventions using `naming-convention` skill.
8. **Documentation** — Structure using `documentation-template` skill.
## Output
Complete spec: overview, anatomy, props/API, variants, states, accessibility, usage guidelines, tokens.
Consider following up with `/audit-system`.
