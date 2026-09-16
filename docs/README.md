# docs/

GitHub Pages source for this repo (Settings → Pages → Deploy from a branch → `main` / `/docs`).

- `index.html` — the live demo. A copy of the built `examples/demo/prototype.html` with one banner
  spliced in linking back to the repo, so someone who lands here from a link with no context knows
  what they are looking at. It is not regenerated automatically; refresh it after any change to
  `examples/demo` with:

  ```sh
  cd examples/demo
  python3 ../../scaffold/adapters/python/build.py --boards boards --model model
  python3 ../../scaffold/gate.py --model model --boards boards
  python3 ../../scaffold/viewer/build_viewer.py --model model --boards boards \
    --out ../../docs/index.html --title "Demo · File manager"
  ```

  then re-add the banner: a `<div class="banner">` block placed right before `<header>`, and the
  matching `.banner` rule in the `<style>` block — see the current file for the exact markup, it is a
  handful of lines.

- `prototype-hero.png` — the screenshot embedded in the top-level `README.md`. Regenerate with a
  headless browser against a built `prototype.html`, deep-linked to a screen with `#<screen-id>`, and
  crop to remove trailing whitespace. There is no script for this; it has been done by hand each time
  the demo changed enough to make the old screenshot stale.
