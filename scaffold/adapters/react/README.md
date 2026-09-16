# react — a third adapter, and the one that emits code you keep

`../python/` is the reference adapter. `../node/` exists to prove the contract is stack-agnostic with
running code. This one exists for a different reason: the first two emit a prototype you throw away,
and most people building a product want the components.

```sh
node build.mjs --boards ../../../examples/demo/boards \
               --model  ../../../examples/demo/model \
               --components ./out
```

It writes both. `boards/<id>.html` is what the gate and the harnesses measure, exactly as before.
`components/<Name>.tsx` is the same screen as a React component, with the rationale carried into the
file as its doc comment.

## One tree, two outputs

A screen is authored once, as a plain element tree — `h(tag, props, ...children)`, no framework. The
board and the component are two renderings of that one tree, so they cannot disagree about what a
screen contains. That property is the only reason emitting a second target is safe; an adapter that
wrote the HTML and the TSX separately would be two sources of truth wearing one name.

## It does not depend on React

React is never imported, and there is no bundler. Emitting a component is a string problem, exactly as
emitting a board already was — which is why adding this adapter added nothing to what the pack needs
in order to run. `npm run typecheck` is the separate, dev-only half: it builds the components into
`.typecheck/` and runs `tsc --noEmit` over them with `@types/react`, so "the emitted components
compile" is a checked claim rather than a hope. Those two packages are `devDependencies` here and are
not needed to build anything.

## It is not Tailwind

The stated goal was React and Tailwind. Tailwind is the half that could not be delivered honestly:
utility classes require a Tailwind build step to produce the stylesheet, and a build step is the
dependency this pack does not take. The emitted components use the same CSS custom properties as the
other two adapters — `tokens.css` is written beside them — mirrored token for token from
`../node/system.mjs`, so a change there that is not made here shows as a diff rather than as drift.

If you want Tailwind, the honest version is a fourth adapter that owns a Tailwind build and is
measured by the same gate. The contract would not change; only the cost of the toolchain would.

## Verifying the claim yourself

```sh
node build.mjs --boards /tmp/rb --model /tmp/rm --components /tmp/rc
python3 ../python/build.py --boards /tmp/pb --model /tmp/pm
diff /tmp/pm/rationale.json /tmp/rm/rationale.json
```

All three adapters emit an identical `model/rationale.json`; CI diffs them on every push. Point
`gate.py` and the harnesses at boards this adapter built and every count matches the other two,
because what is fixed is `boards/<id>.html` plus the model files — not the language that wrote them.
