# Generates mascot.svg, mascot-dark.svg, mascot-head.svg and favicon.svg (run from assets/).
# Mo, the Monsoon mascot: a red panda in a raincoat holding a five color umbrella.
import math
import sys

INK = "#141530"
RUST = "#c4532d"
RUST_D = "#8f3a1e"
CREAM = "#fff4e6"
PAW = "#4a2318"
ROSE = "#f43f5e"
PANELS = ["#3b5bdb", "#22d3ee", "#8b5cf6", "#f43f5e", "#fbbf24"]
SW = 8  # outline weight used everywhere

# Variant "a": yellow raincoat, indigo boots. Variant "b": indigo raincoat, yellow boots.
VARIANT = sys.argv[1] if len(sys.argv) > 1 else "a"
COAT, COAT_D, BOOT = ("#fbbf24", "#e89b0c", "#3b5bdb") if VARIANT == "a" else ("#3b5bdb", "#2f49b8", "#fbbf24")


def ol(w=SW):
    return f'stroke="{INK}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'


O = ol()


def canopy(cx, rim, rx, ry, scallop=12):
    """Five panel umbrella canopy drawn as dome meridians, unrotated."""
    xs = [cx - rx + i * 2 * rx / 5 for i in range(6)]
    top = (cx, rim - ry)
    out = []
    for i, col in enumerate(PANELS):
        a, b = xs[i], xs[i + 1]
        ra, rb = abs(a - cx), abs(b - cx)
        sa = 0 if a < cx else 1  # sweep from apex down to a
        sb = 1 if b < cx else 0  # sweep from b back up to apex
        mid = (a + b) / 2
        d = (f"M{top[0]:.1f} {top[1]:.1f} A{ra:.1f} {ry} 0 0 {sa} {a:.1f} {rim} "
             f"Q{mid:.1f} {rim - scallop * 2} {b:.1f} {rim} "
             f"A{rb:.1f} {ry} 0 0 {sb} {top[0]:.1f} {top[1]:.1f} Z")
        out.append(f'<path d="{d}" fill="{col}" {O}/>')
    # soft gloss on the upper left panels
    out.append(f'<path d="M{cx - rx * .70:.1f} {rim - ry * .30:.1f} A{rx * .78:.1f} {ry * .82:.1f} 0 0 1 {cx - rx * .18:.1f} {rim - ry * .88:.1f}" '
               f'fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="9" stroke-linecap="round"/>')
    for x in xs:
        out.append(f'<circle cx="{x:.1f}" cy="{rim}" r="5.5" fill="{INK}"/>')
    out.append(f'<path d="M{cx} {rim - ry} v-18" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>')
    out.append(f'<circle cx="{cx}" cy="{rim - ry - 20}" r="7" fill="{PANELS[4]}" {ol(5)}/>')
    return "\n    ".join(out)


def head(dx=0, dy=0, simple=False):
    """Red panda head. Local origin: head center, about 240 wide and 200 tall with ears."""
    g = []
    for s in (-1, 1):
        ex = 74 * s
        g.append(f'<path d="M{ex - 34 * s} -44 Q{ex - 18 * s} -108 {ex + 20 * s} -100 Q{ex + 40 * s} -72 {ex + 30 * s} -30 Z" fill="{CREAM}" {O}/>')
        g.append(f'<path d="M{ex - 18 * s} -50 Q{ex - 8 * s} -90 {ex + 14 * s} -86 Q{ex + 24 * s} -66 {ex + 18 * s} -42 Z" fill="{RUST_D}"/>')
    face = ("M0 -84 C64 -84 104 -50 106 -8 L120 22 L100 30 C86 64 46 84 0 84 "
            "C-46 84 -86 64 -100 30 L-120 22 L-106 -8 C-104 -50 -64 -84 0 -84 Z")
    g.append(f'<path d="{face}" fill="{RUST}"/>')
    g.append(f'<path d="M-112 18 C-104 -4 -76 -6 -62 12 C-54 26 -60 52 -80 58 C-94 52 -102 40 -104 26 Z" fill="{CREAM}"/>')
    g.append(f'<path d="M112 18 C104 -4 76 -6 62 12 C54 26 60 52 80 58 C94 52 102 40 104 26 Z" fill="{CREAM}"/>')
    g.append(f'<ellipse cx="0" cy="44" rx="44" ry="32" fill="{CREAM}"/>')
    g.append(f'<ellipse cx="-38" cy="-36" rx="15" ry="10" fill="{CREAM}" transform="rotate(-14 -38 -36)"/>')
    g.append(f'<ellipse cx="38" cy="-36" rx="15" ry="10" fill="{CREAM}" transform="rotate(14 38 -36)"/>')
    g.append(f'<path d="{face}" fill="none" {O}/>')
    if not simple:
        g.append(f'<ellipse cx="-80" cy="30" rx="15" ry="9" fill="{ROSE}" opacity=".45"/>')
        g.append(f'<ellipse cx="80" cy="30" rx="15" ry="9" fill="{ROSE}" opacity=".45"/>')
    for s in (-1, 1):
        x = 38 * s
        if simple:
            g.append(f'<ellipse cx="{x}" cy="4" rx="21" ry="25" fill="{INK}"/>')
            g.append(f'<circle cx="{x + 7}" cy="-5" r="8" fill="#ffffff"/>')
        else:
            g.append(f'<ellipse cx="{x}" cy="2" rx="17" ry="21" fill="{INK}"/>')
            g.append(f'<circle cx="{x + 6}" cy="-6" r="7" fill="#ffffff"/>')
            g.append(f'<circle cx="{x - 6}" cy="10" r="3.2" fill="#ffffff"/>')
    g.append(f'<path d="M-13 24 Q0 20 13 24 Q10 36 0 38 Q-10 36 -13 24 Z" fill="{INK}" {ol(3)}/>')
    if simple:
        return f'<g transform="translate({dx} {dy})">\n    ' + "\n    ".join(g) + "\n  </g>"
    g.append(f'<path d="M0 38 V44" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>')
    g.append(f'<path d="M-20 46 Q0 46 20 46 Q16 70 0 70 Q-16 70 -20 46 Z" fill="{INK}" {ol(5)}/>')
    g.append(f'<path d="M-11 62 Q0 54 11 62 Q8 68 0 68 Q-8 68 -11 62 Z" fill="{ROSE}"/>')
    return f'<g transform="translate({dx} {dy})">\n    ' + "\n    ".join(g) + "\n  </g>"


def drop(x, y, s=1.0, col="#22d3ee"):
    return (f'<path d="M{x} {y - 22 * s:.1f} C{x + 4 * s:.1f} {y - 10 * s:.1f} {x + 13 * s:.1f} {y - 4 * s:.1f} {x + 13 * s:.1f} {y + 5 * s:.1f} '
            f'A{13 * s:.1f} {13 * s:.1f} 0 0 1 {x - 13 * s:.1f} {y + 5 * s:.1f} C{x - 13 * s:.1f} {y - 4 * s:.1f} {x - 4 * s:.1f} {y - 10 * s:.1f} {x} {y - 22 * s:.1f} Z" '
            f'fill="{col}" {ol(5)}/>')


def mascot():
    tilt = -10
    paw = (318, 286)
    t = math.radians(tilt)
    up = (math.sin(t), -math.cos(t))
    d = 158
    cx, rim = round(paw[0] + d * up[0], 1), round(paw[1] + d * up[1], 1)
    L = d + 40
    b = []
    tail = "M140 404 C80 420 26 384 30 326 C33 284 66 262 92 276 C112 288 104 312 88 310 C72 330 82 368 142 372 Z"
    b.append(f'<clipPath id="tc"><path d="{tail}"/></clipPath>')
    b.append(f'<path d="{tail}" fill="{RUST}"/>')
    b.append(f'<g clip-path="url(#tc)" fill="none" stroke="{RUST_D}" stroke-width="16">'
             f'<path d="M20 300 L80 330"/><path d="M14 348 L84 356"/><path d="M40 404 L96 378"/></g>')
    b.append(f'<path d="{tail}" fill="none" {O}/>')
    b.append(f'<g transform="rotate({tilt} {cx} {rim})">')
    hook = f"M{cx} {rim} V{rim + L} a14 14 0 0 0 28 0"
    b.append(f'  <path d="{hook}" fill="none" stroke="{INK}" stroke-width="17" stroke-linecap="round"/>')
    b.append(f'  <path d="{hook}" fill="none" stroke="#e6e9f5" stroke-width="5" stroke-linecap="round"/>')
    b.append("  " + canopy(cx, rim, 138, 108))
    b.append("</g>")
    for x in (154, 214):
        b.append(f'<ellipse cx="{x}" cy="414" rx="30" ry="15" fill="{BOOT}" {O}/>')
    coat = "M136 306 L232 306 C250 336 262 368 266 404 Q186 420 104 404 C108 368 120 336 136 306 Z"
    b.append(f'<path d="{coat}" fill="{COAT}" {O}/>')
    b.append(f'<path d="M184 314 V410" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>')
    for y in (342, 374):
        b.append(f'<rect x="192" y="{y - 6}" width="18" height="12" rx="6" fill="{INK}"/>')
    b.append(f'<path d="M128 382 h34 v14 q-17 6 -34 0 Z" fill="{COAT_D}" {ol(5)}/>')
    b.append(f'<path d="M140 304 L184 318 L160 342 Z M228 304 L184 318 L208 342 Z" fill="{COAT}" {O}/>')
    sl = "M134 330 L86 300"
    b.append(f'<path d="{sl}" stroke="{INK}" stroke-width="{38 + 2 * SW}" stroke-linecap="round"/>')
    b.append(f'<path d="{sl}" stroke="{COAT}" stroke-width="38" stroke-linecap="round"/>')
    b.append(f'<circle cx="76" cy="288" r="19" fill="{PAW}" {O}/>')
    sr = f"M236 328 L{paw[0] - 14} {paw[1] + 12}"
    b.append(f'<path d="{sr}" stroke="{INK}" stroke-width="{38 + 2 * SW}" stroke-linecap="round"/>')
    b.append(f'<path d="{sr}" stroke="{COAT}" stroke-width="38" stroke-linecap="round"/>')
    b.append(head(184, 222))
    b.append(f'<ellipse cx="{paw[0]}" cy="{paw[1]}" rx="19" ry="21" fill="{PAW}" {O}/>')
    b.append(drop(40, 120, 1.0))
    b.append(drop(34, 214, .7, "#8b5cf6"))
    b.append(drop(410, 236, .9))
    b.append(drop(382, 330, .65, "#3b5bdb"))
    return "\n  ".join(b)


svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -14 452 452" width="452" height="452" role="img" aria-labelledby="t d">
  <title id="t">Mo, the Monsoon mascot</title>
  <desc id="d">A cheerful red panda in a raincoat holding an open umbrella with indigo, cyan, violet, rose and amber panels.</desc>
  {mascot()}
</svg>
'''

# mascot-dark.svg: same art and framing with a light sticker rim, so the dark outline does
# not melt into dark pages (GitHub dark is #0d1117). The README serves it through <picture>.
RIM = "#e6e9ff"
svg_dark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -14 452 452" width="452" height="452" role="img" aria-labelledby="t d">
  <title id="t">Mo, the Monsoon mascot</title>
  <desc id="d">A cheerful red panda in a raincoat holding an open umbrella with indigo, cyan, violet, rose and amber panels.</desc>
  <filter id="rim" x="-5%" y="-5%" width="110%" height="110%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grow"/>
    <feFlood flood-color="{RIM}"/>
    <feComposite in2="grow" operator="in" result="edge"/>
    <feMerge><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <g filter="url(#rim)">
  {mascot()}
  </g>
</svg>
'''

head_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="t">
  <title id="t">Mo, the Monsoon mascot</title>
  <g transform="translate(128 136) scale(.9)">{head(0, 0)}</g>
</svg>
'''

# favicon: simplified head on a rounded indigo square, readable at 16px
fav = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="64" height="64">
  <title>Monsoon</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b5bdb"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="60" fill="url(#bg)"/>
  <g transform="translate(128 142) scale(.94)">
  {head(0, 0, simple=True)}
  </g>
</svg>
'''

# usage: python src/mascot_gen.py [variant] [outdir or file.svg]
out = sys.argv[2] if len(sys.argv) > 2 else "."
if out.endswith(".svg"):
    open(out, "w", encoding="utf-8", newline="\n").write(svg)
else:
    for name, text in (("mascot.svg", svg), ("mascot-dark.svg", svg_dark), ("mascot-head.svg", head_svg), ("favicon.svg", fav)):
        open(f"{out}/{name}", "w", encoding="utf-8", newline="\n").write(text)
