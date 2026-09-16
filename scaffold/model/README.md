# model/ — the eight kept files

Copy this directory to start. These eight are hand-kept; `rationale.json` is extracted by the
generator and `index.json` is written by the gate. Never edit either of those.

The files here are the demo's, filled in, because an empty template teaches nothing about the shape.
Replace the contents, not the structure.

There are no JSON schemas in this pack on purpose. The gate reads the files and says exactly what is
wrong at the point it matters; a schema would be a second description of the same thing, drifting
from the first. If you add a field, add it to `gate.py` in the same commit or it is decoration.

| File | Kept by | Notes |
|---|---|---|
| `screens.json` | you | `kind` is one of place, state, detour, entrance. `empty_state: true` on the state that is a place's empty case. `unagreed` flags a claim the scope has not seen. |
| `journeys.json` | you | step names copied verbatim from the scope document |
| `routes.json` | you | `via` is click, gesture or system. Only click routes are label-checked. |
| `gaps.json` | you | keyed `journey/step`, never floating |
| `failures.json` | you | screen id → the clause under which it is a failure |
| `decisions.json` | you | `status` open or settled; every option carries buys, costs, kills |
| `policy.json` | you | terms, zones, and `scan.ignore_selectors` |
| `rationale.json` | the generator | extracted from docstrings at build time |
| `index.json` | the gate | generated; if it is missing the gate refused |
