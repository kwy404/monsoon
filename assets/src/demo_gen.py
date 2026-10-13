# Generates demo.svg (run from assets/). Pure SVG + CSS keyframes, loops forever.
import re

T = 16.0            # loop length in seconds
CW = 8.2            # forced monospace advance per char (textLength keeps it exact)
LH = 26             # code line height
CODE_X, CODE_Y = 74, 112
SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
EDITOR_BG = "#0d0e22"

def pct(t):
    return f"{max(0.0, min(100.0, t / T * 100)):.3f}%"

# Themes: seed, button (AA against white), soft, strong, ramp (5 shades), panel tint, code tint
THEMES = [
    dict(seed="#3b5bdb", btn="#3b5bdb", soft="#e0e7ff", strong="#2b3fa3",
         ramp=["#e0e7ff", "#9fb1f5", "#3b5bdb", "#2b3fa3", "#1b2766"], tint="#eef1ff", code="#8ea2ff"),
    dict(seed="#8b5cf6", btn="#7c3aed", soft="#ede9fe", strong="#5b21b6",
         ramp=["#ede9fe", "#c4b5fd", "#8b5cf6", "#6d28d9", "#3b1680"], tint="#f5f1ff", code="#b9a1ff"),
    dict(seed="#f43f5e", btn="#e11d48", soft="#ffe4e6", strong="#9f1239",
         ramp=["#ffe4e6", "#fda4af", "#f43f5e", "#be123c", "#6b0d24"], tint="#fff1f3", code="#ff8fa3"),
    dict(seed="#22d3ee", btn="#0e7490", soft="#cffafe", strong="#155e75",
         ramp=["#cffafe", "#67e8f9", "#22d3ee", "#0e7490", "#0b3c4a"], tint="#ecfbfe", code="#5fe3f5"),
]
CHANGES = [7.5, 10.0, 12.5]   # seconds where --seed changes
FADE_OUT = 15.4

def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def contrast(a, b="#ffffff"):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

css = []
kf_id = [0]

def keyframes(body):
    kf_id[0] += 1
    name = f"k{kf_id[0]}"
    css.append(f"@keyframes {name}{{{body}}}")
    return name

def anim(name):
    return f"animation:{name} {T}s infinite"

def cycle(prop, values):
    """Hold values[0], then switch at each CHANGES time with a short crossfade."""
    parts = [f"0%,{pct(CHANGES[0] - .15)}{{{prop}:{values[0]}}}"]
    for i, t in enumerate(CHANGES):
        end = CHANGES[i + 1] - .15 if i + 1 < len(CHANGES) else T
        parts.append(f"{pct(t + .15)},{pct(end)}{{{prop}:{values[i + 1]}}}")
    return keyframes("".join(parts))

def appear(t, out=FADE_OUT):
    return keyframes(f"0%,{pct(t)}{{opacity:0}}{pct(t + .3)},{pct(out)}{{opacity:1}}{pct(out + .4)},100%{{opacity:0}}")

def window(t0, t1):
    """Visible only between t0 and t1 (used for the swapping seed values)."""
    parts = []
    start = "0%"
    if t0 > 0:
        parts.append(f"0%,{pct(t0 - .15)}{{opacity:0}}")
        start = pct(t0 + .15)
    if t1 < T:
        parts.append(f"{start},{pct(t1 - .15)}{{opacity:1}}{pct(t1 + .15)},100%{{opacity:0}}")
    else:
        parts.append(f"{start},100%{{opacity:1}}")
    return keyframes("".join(parts))

classes = {}
def cls(name, rule):
    classes[name] = rule
    return name

# Color cycling classes
cls("btn", anim(cycle("fill", [t["btn"] for t in THEMES])))
cls("soft", anim(cycle("fill", [t["soft"] for t in THEMES])))
cls("strong", anim(cycle("fill", [t["strong"] for t in THEMES])))
cls("tint", anim(cycle("fill", [t["tint"] for t in THEMES])))
cls("seedc", anim(cycle("fill", [t["seed"] for t in THEMES])))
cls("codec", anim(cycle("fill", [t["code"] for t in THEMES])))
for i in range(5):
    cls(f"r{i}", anim(cycle("fill", [t["ramp"][i] for t in THEMES])))

# ---------- code ----------
LINES = [
    (0, '<html style="--seed: #3b5bdb">'),
    (0, '<div class="@container rounded-2xl p-6 shadow-lg">'),
    (1, '<div class="flex items-center gap-3">'),
    (2, '<span class="size-11 rounded-full bg-primary"></span>'),
    (2, '<b class="text-lg font-bold">Gale</b>'),
    (2, '<em class="ml-auto bg-muted">new</em>'),
    (1, '</div>'),
    (1, '<p class="mt-3 text-muted">No build step. Ever.</p>'),
    (1, '<button class="mt-4 w-full bg-primary py-2">'),
    (2, 'Subscribe</button>'),
    (0, '</div>'),
]
C_TAG, C_ATTR, C_STR, C_TXT = "#fb7185", "#22d3ee", "#c4b5fd", "#e7ebff"
TOK = re.compile(r'(\s+|</?[\w-]+|/?>|[\w@:-]+=|"[^"]*"|[^<>"\s]+)')

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

TYPE_START, TYPE_STEP, TYPE_DUR = 0.5, 0.42, 0.34
code_svg, covers, lnums = [], [], []
for i, (ind, src) in enumerate(LINES):
    y = CODE_Y + i * LH
    x0 = CODE_X + ind * 2 * CW
    lnums.append(f'<text x="{CODE_X - 26}" y="{y}" text-anchor="end" fill="#4b5180">{i + 1}</text>')
    x = x0
    for m in TOK.finditer(src):
        tok = m.group(0)
        if tok.isspace():
            x += len(tok) * CW
            continue
        if tok.startswith("<") or tok.endswith(">"):
            col = C_TAG
        elif tok.endswith("="):
            col = C_ATTR
        elif tok.startswith('"'):
            col = C_STR
        else:
            col = C_TXT
        if i == 0 and tok == '"--seed: #3b5bdb"':
            # split so the hex value can swap
            pre = '"--seed:'
            code_svg.append(f'<text x="{x:.1f}" y="{y}" fill="{C_STR}" textLength="{len(pre) * CW:.1f}" lengthAdjust="spacingAndGlyphs">{esc(pre)}</text>')
            hx = x + (len(pre) + 1) * CW
            hex_x = hx
            code_svg.append(f'<rect x="{hx - 3:.1f}" y="{y - 15}" width="{7 * CW + 6:.1f}" height="20" rx="4" fill="#ffffff" class="flash"/>')
            code_svg.append('<g class="codec">')
            for k, t in enumerate(THEMES):
                t0 = 0 if k == 0 else CHANGES[k - 1]
                t1 = CHANGES[k] if k < len(CHANGES) else T
                cname = cls(f"s{k}", anim(window(t0, t1)))
                code_svg.append(f'<text x="{hx:.1f}" y="{y}" class="{cname}" textLength="{7 * CW:.1f}" lengthAdjust="spacingAndGlyphs">{t["seed"]}</text>')
            code_svg.append('</g>')
            code_svg.append(f'<text x="{hx + 7 * CW:.1f}" y="{y}" fill="{C_STR}" textLength="{CW:.1f}" lengthAdjust="spacingAndGlyphs">"</text>')
            x += len(tok) * CW
            continue
        code_svg.append(f'<text x="{x:.1f}" y="{y}" fill="{col}" textLength="{len(tok) * CW:.1f}" lengthAdjust="spacingAndGlyphs">{esc(tok)}</text>')
        x += len(tok) * CW
    # typing cover + cursor
    n = len(src)
    s = TYPE_START + i * TYPE_STEP
    e = s + TYPE_DUR
    W = n * CW
    k = keyframes(f"0%,{pct(s)}{{transform:translateX(0px);animation-timing-function:steps({n},end)}}{pct(e)}{{transform:translateX({W:.1f}px)}}{pct(e + .03)},100%{{transform:translateX(900px)}}")
    kc = keyframes(f"0%,{pct(s)}{{transform:translateX(0px);animation-timing-function:steps({n},end)}}{pct(e)},100%{{transform:translateX({W:.1f}px)}}")
    covers.append(f'<rect x="{x0 - 4:.1f}" y="{y - 18}" width="600" height="{LH}" fill="{EDITOR_BG}" style="{anim(k)}"/>')
    last = i == len(LINES) - 1
    vis_end = FADE_OUT if last else e + 0.06
    vis_start = 0 if i == 0 else s - 0.02
    if i == 0:
        ok = keyframes(f"0%,{pct(vis_end)}{{opacity:1}}{pct(vis_end + .01)},100%{{opacity:0}}")
    elif last:
        blinks = "".join(f"{pct(e + .5 * j)}{{opacity:{1 if j % 2 == 0 else 0}}}" for j in range(int((FADE_OUT - e) / .5)))
        ok = keyframes(f"0%,{pct(vis_start)}{{opacity:0}}{pct(vis_start + .01)}{{opacity:1}}{blinks}{pct(FADE_OUT)},100%{{opacity:0}}")
    else:
        ok = keyframes(f"0%,{pct(vis_start)}{{opacity:0}}{pct(vis_start + .01)},{pct(vis_end)}{{opacity:1}}{pct(vis_end + .01)},100%{{opacity:0}}")
    covers.append(f'<g style="{anim(ok)}"><rect x="{x0 - 1:.1f}" y="{y - 15}" width="2.5" height="20" rx="1" fill="#22d3ee" style="{anim(kc)}"/></g>')

# hex flash at each change
fl = "".join(f"{pct(t - .2)}{{opacity:0}}{pct(t)}{{opacity:.22}}{pct(t + .9)}{{opacity:0}}" for t in CHANGES)
cls("flash", anim(keyframes(f"0%{{opacity:0}}{fl}100%{{opacity:0}}")))

# ---------- preview card ----------
line_done = lambda i: TYPE_START + i * TYPE_STEP + TYPE_DUR
cls("a_card", anim(appear(line_done(1))))
cls("a_avatar", anim(appear(line_done(3))))
cls("a_title", anim(appear(line_done(4))))
cls("a_badge", anim(appear(line_done(5))))
cls("a_text", anim(appear(line_done(7))))
cls("a_btn", anim(appear(line_done(9))))
cls("a_swatch", anim(appear(line_done(10) + .4)))
cls("a_code", anim(keyframes(f"0%,{pct(FADE_OUT)}{{opacity:1}}{pct(FADE_OUT + .4)},100%{{opacity:0}}")))

contrasts = [f"{contrast(t['btn']):.1f}:1" for t in THEMES]
ratio_txt = []
for k, r in enumerate(contrasts):
    t0 = 0 if k == 0 else CHANGES[k - 1]
    t1 = CHANGES[k] if k < len(CHANGES) else T
    ratio_txt.append(f'<text x="972" y="452" text-anchor="end" class="s{k}" font-family="{MONO}" font-size="12" font-weight="700" fill="#141530">{r}</text>')

CX, CY, CWD, CHT = 664, 126, 296, 212
style = "\n".join(css) + "\n" + "\n".join(f".{k}{{{v}}}" for k, v in classes.items())

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 520" width="1040" height="520" role="img" aria-labelledby="dt">
<title id="dt">Monsoon demo: utility classes render a card, then one --seed value re-themes it</title>
<style>
{style}
</style>
<rect width="1040" height="520" rx="20" fill="#141530"/>
<circle cx="40" cy="36" r="6" fill="#f43f5e"/><circle cx="60" cy="36" r="6" fill="#8b5cf6"/><circle cx="80" cy="36" r="6" fill="#22d3ee"/>
<text x="520" y="41" text-anchor="middle" font-family="{SANS}" font-size="13" font-weight="600" fill="#7c84b8">monsoon: one CSS file, zero build</text>
<!-- editor -->
<rect x="20" y="60" width="572" height="440" rx="14" fill="{EDITOR_BG}"/>
<rect x="20" y="60" width="572" height="40" rx="14" fill="#191b3d"/>
<rect x="20" y="86" width="572" height="14" fill="#191b3d"/>
<rect x="36" y="68" width="112" height="32" rx="8" fill="{EDITOR_BG}"/>
<rect x="36" y="88" width="112" height="12" fill="{EDITOR_BG}"/>
<text x="92" y="89" text-anchor="middle" font-family="{MONO}" font-size="13" fill="#c9d3ff">index.html</text>
<g font-family="{MONO}" font-size="14">{"".join(lnums)}</g>
<clipPath id="ed"><rect x="20" y="98" width="572" height="362"/></clipPath>
<g class="a_code" font-family="{MONO}" font-size="14">
{chr(10).join(code_svg)}
<rect x="{hex_x + 8 * CW + 12:.1f}" y="{CODE_Y - 12}" width="14" height="14" rx="3" class="seedc" stroke="#ffffff" stroke-opacity=".5"/>
<g clip-path="url(#ed)">
{chr(10).join(covers)}
</g>
</g>
<text x="40" y="482" font-family="{MONO}" font-size="12" fill="#5b6299">&lt;link href="https://cdn.jsdelivr.net/npm/monsooncss"&gt;</text>
<!-- preview -->
<rect x="608" y="60" width="412" height="440" rx="14" class="tint"/>
<rect x="608" y="60" width="412" height="40" rx="14" fill="#ffffff"/>
<rect x="608" y="86" width="412" height="14" fill="#ffffff"/>
<rect x="636" y="70" width="356" height="20" rx="10" fill="#f1f3fb"/>
<text x="814" y="84" text-anchor="middle" font-family="{SANS}" font-size="11.5" fill="#6b7194">localhost/index.html</text>
<g class="a_card">
  <rect x="{CX}" y="{CY + 8}" width="{CWD}" height="{CHT}" rx="20" fill="#141530" opacity=".08"/>
  <rect x="{CX}" y="{CY}" width="{CWD}" height="{CHT}" rx="20" fill="#ffffff" stroke="#e3e7f5"/>
</g>
<g class="a_avatar">
  <circle cx="{CX + 46}" cy="{CY + 48}" r="22" class="btn"/>
  <g fill="#ffffff"><circle cx="{CX + 40}" cy="{CY + 50}" r="6"/><circle cx="{CX + 47}" cy="{CY + 45}" r="7.5"/><circle cx="{CX + 54}" cy="{CY + 50}" r="5.5"/><rect x="{CX + 34}" y="{CY + 49}" width="26" height="7" rx="3.5"/></g>
</g>
<text x="{CX + 80}" y="{CY + 55}" class="a_title" font-family="{SANS}" font-size="19" font-weight="800" fill="#141530">Gale</text>
<g class="a_badge">
  <rect x="{CX + CWD - 74}" y="{CY + 36}" width="50" height="24" rx="12" class="soft"/>
  <text x="{CX + CWD - 49}" y="{CY + 52.5}" text-anchor="middle" font-family="{SANS}" font-size="12" font-weight="700" class="strong">new</text>
</g>
<g class="a_text" font-family="{SANS}">
  <text x="{CX + 24}" y="{CY + 106}" font-size="15" fill="#3d4466">No build step. Ever.</text>
  <rect x="{CX + 24}" y="{CY + 120}" width="200" height="8" rx="4" fill="#e9ecf7"/>
</g>
<g class="a_btn">
  <rect x="{CX + 24}" y="{CY + 146}" width="{CWD - 48}" height="42" rx="12" class="btn"/>
  <text x="{CX + CWD / 2}" y="{CY + 172}" text-anchor="middle" font-family="{SANS}" font-size="15" font-weight="700" fill="#ffffff">Subscribe</text>
</g>
<g class="a_swatch">
  <text x="{CX}" y="380" font-family="{MONO}" font-size="12" fill="#6b7194">theme generated from --seed</text>
  {"".join(f'<rect x="{CX + i * 50}" y="392" width="42" height="30" rx="8" class="r{i}"/>' for i in range(5))}
  <rect x="{CX + 252}" y="392" width="44" height="30" rx="8" fill="#ffffff" stroke="#e3e7f5"/>
  <text x="{CX + 274}" y="412" text-anchor="middle" font-family="{SANS}" font-size="12" font-weight="800" fill="#141530">AA</text>
  <text x="{CX}" y="452" font-family="{SANS}" font-size="12" fill="#6b7194">button text contrast</text>
  {"".join(ratio_txt)}
</g>
</svg>
'''
open("demo.svg", "w", encoding="utf-8", newline="\n").write(svg)
print(len(svg.encode()), "bytes;", contrasts)
