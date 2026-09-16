# node — a second reference adapter

`../python/` is the reference adapter documented in the top-level README. This one exists to prove
the sentence next to it — "any stack satisfies the contract" — with running code, not an assertion.

```sh
node build.mjs --boards ../../../examples/demo/boards --model ../../../examples/demo/model
```

Same ten screens as the Python adapter, same design-system tokens (`system.mjs` mirrors
`../python/system.py` token for token), same rationale text word for word. Point `gate.py` and the
harnesses at boards this adapter built and they behave identically, because the contract they check —
`boards/<id>.html` plus the ten `model/*.json` files — has nothing Python-specific in it.

## Where the rationale comes from

Python has docstrings; JavaScript does not. `build.mjs` gets the same property another way: each
screen function carries a `/** ... */` comment immediately above it, and `build.mjs` reads its own
source file at build time and pairs each comment with the function it precedes. The rationale and the
screen are still the same file, so the reasoning still cannot drift from the screen without the diff
showing it — that property, not docstring syntax specifically, is what the contract actually requires.

## Verifying this claim yourself

```sh
node build.mjs --boards /tmp/node-boards --model /tmp/node-model
diff <(python3 ../python/build.py --boards /tmp/py-boards --model /tmp/py-model >/dev/null; cat /tmp/py-model/rationale.json) /tmp/node-model/rationale.json
```

The only differences will be cosmetic: Python's `json.dumps` escapes non-ASCII characters
(`—` for an em dash) where Node's `JSON.stringify` does not, and file-trailing-newline
conventions differ. The rationale text itself is identical, because it was typed once and copied
into both files.

Then run `python3 ../../gate.py --model /tmp/node-model --boards /tmp/node-boards` and
`node ../../harnesses/run-all.mjs` (with `harness.config.json` pointed at the same two directories) —
both pass with the same counts as they do against the Python-built boards.
