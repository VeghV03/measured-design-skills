---
description: Write a harness per property — each loads the built output, asks the DOM one question and prints a count.
argument-hint: "[property to measure, or 'all']"
---
# /measure
Stage 05. Use `measured-design-measure`.

## Steps
1. Start from `scaffold/harnesses/`: overflow, contrast, translucency, cell fit, structure, vocabulary, routes, density, offline.
2. For each audit finding without a harness, write one. Name the bug in the comment at the top.
3. When a bug escaped, ask which harness should have caught it and why it structurally could not.
4. Run the whole set. Print one number per check.
5. Only route binding refuses the build. Adding a second refusing check is a decision with a cost — state it.

## Output
A harness per property, and a run that prints one number each.
