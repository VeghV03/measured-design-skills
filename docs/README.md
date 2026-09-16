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

- `walkthrough.gif` — the animation embedded in the top-level `README.md`. Built from two kinds of
  frame, screenshotted with a headless browser at `--window-size=1400,900` and cropped to 1400×860:
  - UI frames: a built `prototype.html` deep-linked to a screen with `#<screen-id>`, one screenshot
    per screen worth showing.
  - Terminal frames: a small standalone HTML file styled to look like a terminal window (dark card,
    three dots, monospace body), with the exact commands and output from this demo's own
    "break something on purpose" example in its own README — screenshotted once per step so the
    STOP appears, then again after the fix so the pass does.

  Assembled with `ffmpeg`'s concat demuxer (one entry per frame, a `duration` line after each to set
  its hold time) into a two-pass palette GIF:

  ```sh
  ffmpeg -f concat -safe 0 -i concat.txt -vf "fps=12,scale=1000:-1:flags=lanczos,palettegen" palette.png
  ffmpeg -f concat -safe 0 -i concat.txt -i palette.png \
    -filter_complex "fps=12,scale=1000:-1:flags=lanczos[x];[x][1:v]paletteuse" walkthrough.gif
  ```

  There is no checked-in script for this; the frame list and the terminal template are both cheap to
  reconstruct from a fresh set of screenshots when the demo changes enough to make it stale.

- `social-preview.png` — 1280×640, for Settings → General → Social preview (not settable from a
  file; upload it there by hand). Same palette and stat block as the README's opening hook, so a link
  card and the page it points to look like the same product.
