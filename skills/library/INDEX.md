# The measured-design library

88 vendored skills. Every one is renamed to a collection-qualified form, because Codex does not merge
skills that share a `name` — it shows both in the selector. `frame-problem` would collide with the upstream
designer-skills copy; `ux-strategy-frame-problem` cannot.

All are marked `disable-model-invocation: true`. They are reached deliberately, from a stage skill, not picked
up opportunistically. That also keeps them out of the pre-loaded skill list, which Codex caps at ~8,000
characters — 88 auto-indexed skills would be silently truncated.

| qualified name | upstream id |
|---|---|
| `accessible-content-readable-content` | `accessible-content:readable-content` |
| `accessible-content-review` | `accessible-content:review` |
| `adaptive-interfaces-information-density` | `adaptive-interfaces:information-density` |
| `adaptive-interfaces-responsive-review` | `adaptive-interfaces:responsive-review` |
| `ai-alignment-reasoning-harm-anticipation` | `ai-alignment-reasoning:harm-anticipation` |
| `ai-alignment-reasoning-red-team` | `ai-alignment-reasoning:red-team` |
| `ai-alignment-reasoning-transparency-patterns` | `ai-alignment-reasoning:transparency-patterns` |
| `cross-functional-alignment-decision-log` | `cross-functional-alignment:decision-log` |
| `design-ops-design-critique` | `design-ops:design-critique` |
| `design-ops-design-qa-checklist` | `design-ops:design-qa-checklist` |
| `design-ops-handoff-spec` | `design-ops:handoff-spec` |
| `design-research-card-sort-analysis` | `design-research:card-sort-analysis` |
| `design-research-empathy-map` | `design-research:empathy-map` |
| `design-research-jobs-to-be-done` | `design-research:jobs-to-be-done` |
| `design-research-journey-map` | `design-research:journey-map` |
| `design-research-user-persona` | `design-research:user-persona` |
| `design-systems-accessibility-audit` | `design-systems:accessibility-audit` |
| `design-systems-audit-system` | `design-systems:audit-system` |
| `design-systems-component-spec` | `design-systems:component-spec` |
| `design-systems-create-component` | `design-systems:create-component` |
| `design-systems-design-token` | `design-systems:design-token` |
| `design-systems-documentation-template` | `design-systems:documentation-template` |
| `design-systems-theming-system` | `design-systems:theming-system` |
| `designer-toolkit-design-negotiation` | `designer-toolkit:design-negotiation` |
| `designer-toolkit-design-rationale` | `designer-toolkit:design-rationale` |
| `designer-toolkit-design-token-audit` | `designer-toolkit:design-token-audit` |
| `designer-toolkit-ux-writing` | `designer-toolkit:ux-writing` |
| `inclusive-interaction-audit` | `inclusive-interaction:audit` |
| `interaction-design-design-interaction` | `interaction-design:design-interaction` |
| `interaction-design-doherty-threshold` | `interaction-design:doherty-threshold` |
| `interaction-design-error-flow` | `interaction-design:error-flow` |
| `interaction-design-error-handling-ux` | `interaction-design:error-handling-ux` |
| `interaction-design-feedback-patterns` | `interaction-design:feedback-patterns` |
| `interaction-design-fitts-law` | `interaction-design:fitts-law` |
| `interaction-design-form-design` | `interaction-design:form-design` |
| `interaction-design-gesture-patterns` | `interaction-design:gesture-patterns` |
| `interaction-design-hicks-law` | `interaction-design:hicks-law` |
| `interaction-design-jakobs-law` | `interaction-design:jakobs-law` |
| `interaction-design-loading-states` | `interaction-design:loading-states` |
| `interaction-design-micro-interaction-spec` | `interaction-design:micro-interaction-spec` |
| `interaction-design-navigation-patterns` | `interaction-design:navigation-patterns` |
| `interaction-design-onboarding-design` | `interaction-design:onboarding-design` |
| `interaction-design-state-machine` | `interaction-design:state-machine` |
| `interaction-design-teslers-law` | `interaction-design:teslers-law` |
| `model-interaction-design-design-conversation` | `model-interaction-design:design-conversation` |
| `prototyping-testing-accessibility-test-plan` | `prototyping-testing:accessibility-test-plan` |
| `prototyping-testing-heuristic-evaluation` | `prototyping-testing:heuristic-evaluation` |
| `prototyping-testing-user-flow-diagram` | `prototyping-testing:user-flow-diagram` |
| `thinking-bounded-rationality` | `thinking-bounded-rationality` |
| `thinking-circle-of-competence` | `thinking-circle-of-competence` |
| `thinking-cynefin` | `thinking-cynefin` |
| `thinking-first-principles` | `thinking-first-principles` |
| `thinking-five-whys-plus` | `thinking-five-whys-plus` |
| `thinking-jobs-to-be-done` | `thinking-jobs-to-be-done` |
| `thinking-kepner-tregoe` | `thinking-kepner-tregoe` |
| `thinking-map-territory` | `thinking-map-territory` |
| `thinking-margin-of-safety` | `thinking-margin-of-safety` |
| `thinking-model-router` | `thinking-model-router` |
| `thinking-opportunity-cost` | `thinking-opportunity-cost` |
| `thinking-pre-mortem` | `thinking-pre-mortem` |
| `thinking-probabilistic` | `thinking-probabilistic` |
| `thinking-red-team` | `thinking-red-team` |
| `thinking-reversibility` | `thinking-reversibility` |
| `thinking-scientific-method` | `thinking-scientific-method` |
| `thinking-second-order` | `thinking-second-order` |
| `thinking-socratic` | `thinking-socratic` |
| `thinking-steel-manning` | `thinking-steel-manning` |
| `thinking-systems` | `thinking-systems` |
| `thinking-theory-of-constraints` | `thinking-theory-of-constraints` |
| `thinking-via-negativa` | `thinking-via-negativa` |
| `ui-design-color-system` | `ui-design:color-system` |
| `ui-design-dark-mode-design` | `ui-design:dark-mode-design` |
| `ui-design-data-visualization` | `ui-design:data-visualization` |
| `ui-design-design-screen` | `ui-design:design-screen` |
| `ui-design-platform-conventions` | `ui-design:platform-conventions` |
| `ui-design-readable-measure` | `ui-design:readable-measure` |
| `ui-design-typography-scale` | `ui-design:typography-scale` |
| `ux-strategy-content-strategy` | `ux-strategy:content-strategy` |
| `ux-strategy-design-brief` | `ux-strategy:design-brief` |
| `ux-strategy-design-principles` | `ux-strategy:design-principles` |
| `ux-strategy-experience-map` | `ux-strategy:experience-map` |
| `ux-strategy-frame-problem` | `ux-strategy:frame-problem` |
| `ux-strategy-information-architecture` | `ux-strategy:information-architecture` |
| `ux-strategy-north-star-vision` | `ux-strategy:north-star-vision` |
| `visual-critique-critique-affordance` | `visual-critique:critique-affordance` |
| `visual-critique-critique-information-density` | `visual-critique:critique-information-density` |
| `visual-critique-critique-screen` | `visual-critique:critique-screen` |
| `visual-critique-critique-typography` | `visual-critique:critique-typography` |

## Licences

designer-skills — MIT, MC Dean. cc-thinking-skills — MIT, TJ Boudreaux. Full texts in `licenses/`.
Bodies are unmodified; only the frontmatter `name` and a provenance comment were changed.
