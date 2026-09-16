"""The design system, in code. Every screen imports from here and nothing else.

Tokens first, both themes at token level from the start — retrofitting dark mode
means auditing every screen twice. One function per icon. One shell function every
screen calls, so the window chrome is identical by construction rather than by
discipline.

This is the reference adapter. Any language satisfies the contract; what is fixed
is boards/<id>.html plus the eight model files, not this file.
"""

TOKENS = """
:root{
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-6:24px; --space-8:32px;
  --radius:8px; --radius-lg:12px;
  --type-body:15px; --type-small:13px; --type-head:20px; --measure:34em;
  --bg:#fbfbf9; --card:#fff; --fg:#1d1d1b; --mut:#6b6b66; --line:#e2e1db;
  --acc:#1d6e56; --warn:#8a4b0b; --danger:#a32d2d;
}
:root[data-theme=dark],
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){
  --bg:#141413; --card:#1c1c1a; --fg:#eceae2; --mut:#97958d; --line:#2c2c2a;
  --acc:#5dcaa5; --warn:#efa727; --danger:#f09595;
}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);
  font:var(--type-body)/1.6 ui-sans-serif,system-ui,sans-serif}
.win{max-width:1080px;margin:0 auto;background:var(--card);border:1px solid var(--line);
  border-radius:var(--radius-lg);overflow:hidden}
.chrome{display:flex;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);
  border-bottom:1px solid var(--line)}
.nav{display:flex;gap:var(--space-2);color:var(--mut);font-size:var(--type-small)}
.nav [aria-current=page]{color:var(--fg)}
.body{padding:var(--space-6)}
h1{font-size:var(--type-head);font-weight:500;margin:0 0 var(--space-2)}
p{max-width:var(--measure);color:var(--mut);margin:0 0 var(--space-3)}
.btn{font:inherit;border:1px solid var(--line);background:none;color:var(--fg);
  border-radius:var(--radius);padding:var(--space-2) var(--space-3);cursor:pointer}
.btn.primary{border-color:var(--acc);color:var(--acc)}
.btn.danger{border-color:var(--danger);color:var(--danger)}
.chip{display:inline-block;border:1px solid var(--line);border-radius:999px;
  padding:1px var(--space-2);font-size:var(--type-small);color:var(--mut);
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.empty{text-align:center;padding:var(--space-8) var(--space-4)}
.empty p{margin-inline:auto}
.grid{display:grid;grid-template-columns:1fr 132px 120px;gap:var(--space-3);align-items:center}
.who{color:var(--mut);font-size:var(--type-small)}
.scrim{position:absolute;inset:0;background:rgba(0,0,0,.45)}
"""


def icon(name: str) -> str:
    paths = {
        "folder": "M3 6h5l2 2h11v10H3z",
        "file": "M6 3h8l4 4v14H6z",
        "share": "M12 3v12M8 7l4-4 4 4M5 15v6h14v-6",
        "warn": "M12 4l9 16H3zM12 10v4M12 17h.01",
    }
    d = paths.get(name, paths["file"])
    return (f'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" '
            f'stroke="currentColor" stroke-width="1.5"><path d="{d}"/></svg>')


def shell(title: str, body: str, nav_current: str = "", nav=("Files", "Shared", "Removed")) -> str:
    """The window chrome every screen wears. Identical by construction."""
    items = "".join(
        f'<span{" aria-current=page" if n == nav_current else ""}>{n}</span>' for n in nav)
    return f"""<!doctype html>
<meta charset="utf-8"><title>{title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{TOKENS}</style>
<body><div class="win">
<div class="chrome">{icon('folder')}<nav class="nav">{items}</nav></div>
<div class="body">{body}</div>
</div></body>"""


# --- components: the moment two screens do the same thing -------------------

def empty_state(glyph: str, heading: str, line: str, action: str, foot: str = "") -> str:
    """Answers the same three questions on every empty place: where you are,
    what this place is for, and the one action that fills it."""
    return (f'<div class="empty" data-component="empty_state">{icon(glyph)}'
            f'<h1>{heading}</h1><p>{line}</p>'
            f'<button class="btn primary">{action}</button>'
            f'{f"<p>{foot}</p>" if foot else ""}</div>')


def door(consequence: str, will_not: list, precondition: str, action: str) -> str:
    """The shape of every irreversible confirmation. The what-this-will-not-do
    list is the part people skip and the part that prevents the worst outcome."""
    items = "".join(f"<li>{w}</li>" for w in will_not)
    return (f'<div data-component="door"><h1>{consequence}</h1>'
            f'<p>What this will not do:</p><ul>{items}</ul>'
            f'<p>{precondition}</p><button class="btn danger">{action}</button></div>')


def who_cell(who: str) -> str:
    """Access language in one place — which is why it reads the same on every
    board instead of being a chip on some of them."""
    return f'<span class="who" data-component="who_cell">{who}</span>'


def row(name: str, who: str, meta: str) -> str:
    return (f'<div class="grid" data-component="row"><span>{icon("file")} {name}</span>'
            f'{who_cell(who)}<span class="chip">{meta}</span></div>')
