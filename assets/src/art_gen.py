# Generates art/dark/*.svg and art/light/*.svg plus art/index.json (run from anywhere).
# Isometric (30 degree) line drawings for the docs landing page, viewBox 160x120.
# dark: light strokes for dark pages. light: dark strokes for white pages.
# One accent color per illustration (cyan or violet). Ids are prefixed per file and
# per variant so several drawings can be inlined into one page without clashes.
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "art")
C = math.cos(math.pi / 6)

THEMES = {
    "dark": dict(
        s="#e6e9ff", cyan="#22d3ee", violet="#8b5cf6",
        t=("#262a5e", .5), l=("#141530", .82), r=("#0e0f26", .9),
        hi=("#e6e9ff", .16), lo=("#141530", .9), sc=("#090a1e", .75), sh=("#04050e", .55), tex=.38,
    ),
    "light": dict(
        s="#1e2240", cyan="#0891b2", violet="#7c3aed",
        t=("#f6f7ff", .94), l=("#e4e7f8", .94), r=("#d3d8f0", .94),
        hi=("#ffffff", .95), lo=("#1e2240", .85), sc=("#e9ecfb", .96), sh=("#1e2240", .1), tex=.3,
    ),
}
SW = 1.7


def n(v):
    s = f"{v:.1f}"
    if s.endswith(".0"):
        s = s[:-2]
    if s in ("-0",):
        s = "0"
    if s.startswith("0."):
        s = s[1:]
    elif s.startswith("-0."):
        s = "-" + s[2:]
    return s


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


class Art:
    def __init__(self, name, theme, accent, ox=80, oy=60):
        self.name, self.theme = name, theme
        self.T = THEMES[theme]
        self.acc = self.T[accent]
        self.ox, self.oy = ox, oy
        self.el = []
        self.id = f"mz-{name}-{theme[0]}"
        self.defs = set()
        self.k = 1
        self.bb = [1e9, 1e9, -1e9, -1e9]

    def track(self, x, y):
        b = self.bb
        b[0], b[1], b[2], b[3] = min(b[0], x), min(b[1], y), max(b[2], x), max(b[3], y)

    # projection
    def P(self, x, y, z=0):
        p = (self.ox + (x - y) * C, self.oy + (x + y) * .5 - z)
        self.track(*p)
        return p

    def pts(self, p3):
        return " ".join(f"{n(a)},{n(b)}" for a, b in (self.P(*p) for p in p3))

    def pts2(self, p2):
        return " ".join(f"{n(a)},{n(b)}" for a, b in p2)

    def a(self, fill=None, fo=None, stroke=True, acc=False, sw=None, dash=None, op=None):
        s = ""
        if fill in ("t", "l", "r", "hi", "lo", "sc", "sh"):
            col, o = self.T[fill]
            s += f' fill="{col}" fill-opacity="{n(o) if fo is None else n(fo)}"'
        elif fill == "dots":
            self.defs.add("dots")
            s += f' fill="url(#{self.id}-d)"'
        elif fill == "hatch":
            self.defs.add("hatch")
            s += f' fill="url(#{self.id}-h)"'
        elif fill == "mesh":
            self.defs.add("mesh")
            s += f' fill="url(#{self.id}-m)"'
        elif fill == "acc":
            s += f' fill="{self.acc}"' + (f' fill-opacity="{n(fo)}"' if fo is not None else "")
        elif fill == "s":
            s += f' fill="{self.T["s"]}"' + (f' fill-opacity="{n(fo)}"' if fo is not None else "")
        elif fill:
            s += f' fill="{fill}"' + (f' fill-opacity="{n(fo)}"' if fo is not None else "")
        if not stroke:
            s += ' stroke="none"'
        elif acc:
            s += f' stroke="{self.acc}"'
        if sw:
            s += f' stroke-width="{n(sw / self.k)}"'
        if dash:
            s += f' stroke-dasharray="{" ".join(n(float(v) / self.k) for v in dash.split())}"'
        if op is not None:
            s += f' opacity="{n(op)}"'
        return s

    def add(self, s):
        self.el.append(s)

    def poly(self, p3, **k):
        self.add(f'<path d="M{self.pts(p3)}Z"{self.a(**k)}/>')

    def line(self, p3, **k):
        self.add(f'<path d="M{self.pts(p3)}"{self.a(**k)}/>')

    def path2(self, d, **k):
        self.add(f'<path d="{d}"{self.a(**k)}/>')

    def solid(self, v, tex=None, fills=None, top_fo=None, **k):
        """Convex hexahedron, corners indexed by bits (x, y, z). Draws visible faces."""
        faces = [(0, 2, 6, 4), (1, 3, 7, 5), (0, 1, 5, 4), (2, 3, 7, 6), (0, 1, 3, 2), (4, 5, 7, 6)]
        cen = tuple(sum(p[i] for p in v) / 8 for i in range(3))
        out = []
        for f in faces:
            q = [v[i] for i in f]
            nn = cross(sub(q[1], q[0]), sub(q[2], q[0]))
            fc = tuple(sum(p[i] for p in q) / 4 for i in range(3))
            if dot(nn, sub(fc, cen)) < 0:
                nn = tuple(-c for c in nn)
            vis = dot(nn, (1, 1, 1))
            if vis <= 1e-6:
                continue
            ln = math.sqrt(dot(nn, nn))
            nz, nx, ny = nn[2] / ln, nn[0] / ln, nn[1] / ln
            kind = "t" if nz > .55 else ("r" if nx > ny else "l")
            out.append((kind, q))
        out.sort(key=lambda o: o[0] == "t")
        tops = []
        for kind, q in out:
            fill = (fills or {}).get(kind, kind)
            fo = top_fo if kind == "t" else None
            self.poly(q, fill=fill, fo=fo, **k)
            if kind == "t":
                tops.append(q)
        if tex:
            for q in tops:
                self.poly(q, fill=tex, stroke=False)
        return tops

    def box(self, x, y, z, w, d, h, **k):
        v = [(x + w * (i & 1), y + d * ((i >> 1) & 1), z + h * ((i >> 2) & 1)) for i in range(8)]
        return self.solid(v, **k)

    def prism(self, base, z, h, top=None, side=None, tex=None, **k):
        """Vertical prism on a convex xy polygon."""
        ar = sum(base[i][0] * base[(i + 1) % len(base)][1] - base[(i + 1) % len(base)][0] * base[i][1] for i in range(len(base)))
        sg = 1 if ar > 0 else -1
        for i in range(len(base)):
            p, q = base[i], base[(i + 1) % len(base)]
            nx, ny = sg * (q[1] - p[1]), -sg * (q[0] - p[0])
            if nx + ny > 1e-6 and h > 0:
                kind = "r" if nx > ny else "l"
                self.poly([(p[0], p[1], z), (q[0], q[1], z), (q[0], q[1], z + h), (p[0], p[1], z + h)],
                          fill=side or kind, **k)
        t3 = [(p[0], p[1], z + h) for p in base]
        self.poly(t3, fill=top or "t", **k)
        if tex:
            self.poly(t3, fill=tex, stroke=False)

    def ell(self, cx, cy, z, r, **k):
        x, y = self.P(cx, cy, z)
        self.track(x - r * 1.2247, y - r * .7071)
        self.track(x + r * 1.2247, y + r * .7071)
        self.add(f'<ellipse cx="{n(x)}" cy="{n(y)}" rx="{n(r * 1.2247)}" ry="{n(r * .7071)}"{self.a(**k)}/>')

    def cyl(self, cx, cy, z, r, h, top="t", side="l", tex=None, **k):
        x, yb = self.P(cx, cy, z)
        yt = yb - h
        rx, ry = r * 1.2247, r * .7071
        if h > 0:
            self.path2(f"M{n(x - rx)},{n(yb)}A{n(rx)} {n(ry)} 0 0 0 {n(x + rx)},{n(yb)}V{n(yt)}"
                       f"A{n(rx)} {n(ry)} 0 0 1 {n(x - rx)},{n(yt)}Z", fill=side, **k)
        self.ell(cx, cy, z + h, r, fill=top, **k)
        if tex:
            self.ell(cx, cy, z + h, r, fill=tex, stroke=False)

    def top_m(self, x, y, z):
        ex, ey = self.P(x, y, z)
        return f"matrix({n(C)} .5 {n(-C)} .5 {n(ex)} {n(ey)})"

    def left_m(self, x, y, z):
        ex, ey = self.P(x, y, z)
        return f"matrix({n(C)} .5 0 1 {n(ex)} {n(ey)})"

    def right_m(self, x, y, z):
        ex, ey = self.P(x, y, z)
        return f"matrix({n(C)} -.5 0 1 {n(ex)} {n(ey)})"

    def g(self, transform, inner, **k):
        self.add(f'<g transform="{transform}"{self.a(**k)}>{inner}</g>')

    def svg(self, extra_defs="", fit=None):
        s = self.T["s"]
        d = []
        if "dots" in self.defs:
            d.append(f'<pattern id="{self.id}-d" width="{n(2 * C * 3.2)}" height="3.2" patternUnits="userSpaceOnUse">'
                     f'<circle cx="1" cy="1" r=".5" fill="{s}" fill-opacity="{self.T["tex"]}"/>'
                     f'<circle cx="{n(1 + C * 3.2)}" cy="2.6" r=".5" fill="{s}" fill-opacity="{self.T["tex"]}"/></pattern>')
        if "hatch" in self.defs:
            d.append(f'<pattern id="{self.id}-h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">'
                     f'<path d="M0 .5H3" stroke="{s}" stroke-opacity="{self.T["tex"]}" stroke-width=".6"/></pattern>')
        if "mesh" in self.defs:
            d.append(f'<pattern id="{self.id}-m" width="{n(2 * C * 3)}" height="3" patternUnits="userSpaceOnUse">'
                     f'<path d="M0 0l{n(2 * C * 3)} 3M0 3l{n(2 * C * 3)}-3" stroke="{s}" stroke-opacity=".45" stroke-width=".5"/></pattern>')
        defs = "<defs>" + "".join(d) + extra_defs + "</defs>" if (d or extra_defs) else ""
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" fill="none">{defs}'
                f'<g stroke="{s}" stroke-width="{n(SW / self.k)}" stroke-linejoin="round" stroke-linecap="round" opacity=".9"'
                + (f' transform="{fit}"' if fit else "") + ">"
                + "".join(self.el) + "</g></svg>")


# ---------------------------------------------------------------- scenes

def filters(A):
    A.oy = 66
    w, d = 26, 20
    for i, z in enumerate((-22, -6, 10)):
        A.box(-w, -d, z, 2 * w, 2 * d, 2.5, top_fo=.38 if i else None, tex="dots" if i == 0 else None)
        if i == 1:
            A.ell(10, -8, z + 2.5, 4.5, sw=1.2)
            A.line([(-22, 14, z + 2.5), (-12, 2, z + 2.5), (-4, 8, z + 2.5), (8, -6, z + 2.5), (22, 8, z + 2.5)], sw=1.2)
        if i < 2:
            for cx, cy in ((w, d), (-w, d), (w, -d)):
                A.line([(cx, cy, z + 2.5), (cx, cy, z + 16)], sw=.8, dash="1.5 2.5", op=.7)
    z = 12.5
    for gx in (-13, 0, 13):
        A.line([(gx, -d + 3, z), (gx, d - 3, z)], sw=.6, op=.5)
    for gy in (-7, 7):
        A.line([(-w + 3, gy, z), (w - 3, gy, z)], sw=.6, op=.5)
    A.line([(-w + 3, d - 3, z), (w - 3, -d + 3, z)], sw=.7, dash="1.5 2", op=.6)
    pts = []
    for k in range(13):
        t = k / 12
        u = t * t * (3 - 2 * t)
        u = .55 * u + .45 * (t ** .55)
        pts.append((-w + 3 + t * (2 * w - 6), d - 3 - u * (2 * d - 6), z))
    A.line(pts, acc=True, sw=2.2)
    for p in (pts[4], pts[9]):
        A.ell(p[0], p[1], z, 1.6, fill="acc", acc=True, sw=1)


def dark_mode(A):
    A.oy = 62
    w, d, h = 36, 20, 9
    A.box(-w, -d, -6, w, 2 * d, h, fills={"t": "hi"}, tex="dots")
    A.box(0, -d, -6, w, 2 * d, h, fills={"t": "lo"}, tex="hatch")
    z = 3
    A.ell(-18, 0, z, 6.5, fill="hi", sw=1.4)
    for k in range(8):
        ang = k * math.pi / 4
        A.line([(-18 + 9.5 * math.cos(ang), 9.5 * math.sin(ang), z), (-18 + 13 * math.cos(ang), 13 * math.sin(ang), z)], sw=1.3)
    # crescent moon on the dark half, drawn in the top plane
    r = 8
    moon = (f'<path d="M{n(-r * .2)} {n(-r)}A{r} {r} 0 1 0 {n(r * .2)} {n(r * .98)}'
            f'A{n(r * .78)} {n(r * .78)} 0 1 1 {n(-r * .2)} {n(-r)}Z"/>')
    A.g(A.top_m(18, 0, z), moon, fill="acc", fo=.85, acc=True, sw=1.2)
    for sx, sy in ((28, -12), (8, -14), (30, 10)):
        A.g(A.top_m(sx, sy, z), '<path d="M-1.6 0H1.6M0 -1.6V1.6"/>', acc=True, sw=1)
    # knob riding on the seam
    A.cyl(0, 0, z, 5, 4, top="t", side="r")
    A.ell(0, 0, z + 4, 2.2, sw=1)


def css_variables(A):
    A.oy = 60
    A.box(-26, -32, -10, 52, 64, 4, tex="dots")
    z = -6
    A.box(-23, -29, z, 46, 58, .01, fills={"t": "sc"}, sw=1.1)
    for i, cx in enumerate((-19, -15, -11)):
        A.ell(cx, -25, z, 1.2, fill="s", fo=.6, stroke=False)
    rows = [(-18, -18, 22), (-12, -14, 14), (-6, -14, 26), (0, -18, 10), (6, -10, 0), (16, -14, 18), (22, -18, 24)]
    for y, x0, ln in rows:
        if ln:
            A.line([(x0, y, z), (x0 + ln, y, z)], sw=1.3, op=.75)
    # floating chip with the seed token
    cz = 10
    x0, x1, y0, y1 = -18, 20, 1, 12
    for cx, cy in ((x0, y1), (x1, y1), (x1, y0)):
        A.line([(cx, cy, z), (cx, cy, cz)], acc=True, sw=.8, dash="1.5 2")
    A.poly([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], fill="acc", fo=.12, stroke=False)
    A.box(x0, y0, cz, x1 - x0, y1 - y0, 2.5, fills={"t": "sc"}, acc=True, sw=1.5)
    A.poly([(x0, y0, cz + 2.5), (x1, y0, cz + 2.5), (x1, y1, cz + 2.5), (x0, y1, cz + 2.5)], fill="acc", fo=.16, stroke=False)
    A.g(A.top_m(x0 + 4, y0 + 8, cz + 2.5),
        f'<text font-family="ui-monospace,Menlo,Consolas,monospace" font-size="7" font-weight="700" fill="{A.acc}" stroke="none">--seed</text>')
    A.ell(x1 - 5, (y0 + y1) / 2, cz + 2.5, 2.4, fill="acc", stroke=False)


def palette(A):
    A.oy = 66
    px, py = -22, 22
    angs = [-100, -76, -52, -28, -4]
    for i, ang in enumerate(angs):
        t = math.radians(ang)
        ux, uy = math.cos(t), math.sin(t)
        vx, vy = -uy, ux
        L, W = 62, 6.5
        z = -6 + i * 2.6
        base = [(px - 6 * ux + s * W * vx + e * ux, py - 6 * uy + s * W * vy + e * uy) for s, e in ((-1, 0), (-1, L), (1, L), (1, 0))]
        A.prism(base, z, 2, tex="dots" if i % 2 == 0 else None)
        sw_ = [(px + (L - 22) * ux + s * (W - 1.5) * vx + e * ux, py + (L - 22) * uy + s * (W - 1.5) * vy + e * uy)
               for s, e in ((-1, 0), (-1, 13), (1, 13), (1, 0))]
        top = [(p[0], p[1], z + 2) for p in sw_]
        if i == len(angs) - 1:
            A.poly(top, fill="acc", fo=.9, acc=True, sw=1.2)
        else:
            A.poly(top, fill=("hatch", "s", "hatch", "lo")[i], fo=(None, .25, None, None)[i], sw=1)
        for k in (1, 2):
            p0 = (px + (L - 30 - k * 6) * ux, py + (L - 30 - k * 6) * uy)
            A.line([(p0[0] - 3 * vx, p0[1] - 3 * vy, z + 2), (p0[0] + 3 * vx, p0[1] + 3 * vy, z + 2)], sw=.8, op=.6)
    A.cyl(px, py, -6 + 5 * 2.6, 3.4, 2.4, top="t", side="r", acc=True, sw=1.3)


def grid_layout(A):
    A.oy = 70
    A.box(-35, -35, -16, 70, 70, 4, tex="dots")
    z0 = -12
    s, gap = 19, 4
    lift = {(1, 0): 22, (2, 1): 12, (0, 2): 8}
    tiles = []
    for i in range(3):
        for j in range(3):
            x = -31.5 + i * (s + gap)
            y = -31.5 + j * (s + gap)
            tiles.append((i + j, i, j, x, y))
    tiles.sort()
    for _, i, j, x, y in tiles:
        lz = lift.get((i, j), 0)
        if lz:
            A.poly([(x, y, z0), (x + s, y, z0), (x + s, y + s, z0), (x, y + s, z0)], sw=1, dash="2 2.5", op=.8)
            for cx, cy in ((x + s, y + s), (x, y + s), (x + s, y)):
                A.line([(cx, cy, z0), (cx, cy, z0 + lz)], sw=.8, dash="1.5 2.5", op=.7, acc=(i, j) == (1, 0))
            if (i, j) == (1, 0):
                A.box(x, y, z0 + lz, s, s, 3, fills={"t": "acc"}, top_fo=.2, acc=True)
                A.line([(x + 4, y + 6, z0 + lz + 3), (x + s - 4, y + 6, z0 + lz + 3)], acc=True, sw=1.2)
                A.line([(x + 4, y + 11, z0 + lz + 3), (x + 11, y + 11, z0 + lz + 3)], acc=True, sw=1.2)
            else:
                A.box(x, y, z0 + lz, s, s, 3, tex="hatch")
        else:
            A.box(x, y, z0, s, s, 2)


def transitions(A):
    A.oy = 64
    A.box(-40, -30, -14, 80, 60, .01, fills={"t": "t"}, top_fo=.25, sw=1, dash="2 3", op=.6)
    p = [(-38, 20), (-4, 38), (6, -38), (38, -18)]

    def bez(t):
        m = 1 - t
        return (m ** 3 * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t ** 3 * p[3][0],
                m ** 3 * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t ** 3 * p[3][1])
    z = -14
    pts = [(*bez(k / 30), z) for k in range(31)]
    A.line(pts, sw=1.2, dash="2 3")
    for k in range(1, 10):
        t = k / 10
        a, b = bez(t - .01), bez(t + .01)
        tx, ty = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(tx, ty)
        nx, ny = -ty / ln * 3, tx / ln * 3
        c = bez(t)
        A.line([(c[0] - nx, c[1] - ny, z), (c[0] + nx, c[1] + ny, z)], sw=1)
    for t, op in ((.08, .35), (.32, .55), (.6, .8)):
        c = bez(t)
        A.cyl(c[0], c[1], z, 7, 3, top="t", side="l", op=op, sw=1.4)
    c = bez(.9)
    a, b = bez(.84), bez(.9)
    tx, ty = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(tx, ty)
    ux, uy = tx / ln, ty / ln
    for off, ln2 in ((-4, 7), (0, 11), (4, 7)):
        s0 = (c[0] - ux * 11 - uy * off, c[1] - uy * 11 + ux * off)
        A.line([(s0[0], s0[1], z + 4), (s0[0] - ux * ln2, s0[1] - uy * ln2, z + 4)], acc=True, sw=1.3)
    A.cyl(c[0], c[1], z, 7.5, 4, top="acc", side="l", acc=True)
    A.ell(c[0], c[1], z + 4, 7.5, fill="acc", fo=.25, stroke=False)
    A.ell(c[0], c[1], z + 4, 3, acc=True, sw=1.1)


def cascade_layers(A):
    A.oy = 64
    w, d = 30, 22
    zs = (-22, -4, 14)
    for i, z in enumerate(zs):
        top = A.box(-w, -d, z, 2 * w, 2 * d, 3.5, tex=("dots", "hatch", None)[i])
        zt = z + 3.5
        A.box(w - 2, -d + 6, z + .5, 6, 10, 2.5, fills={"t": "acc" if i == 2 else "t"}, top_fo=.6 if i == 2 else None, acc=i == 2, sw=1.2)
        if i == 2:
            A.poly([(-w + 5, -d + 5, zt), (w - 5, -d + 5, zt), (w - 5, d - 5, zt), (-w + 5, d - 5, zt)], acc=True, sw=1.2, dash="2.5 2")
            A.line([(-w + 10, -8, zt), (w - 16, -8, zt)], sw=1.3)
            A.line([(-w + 10, 0, zt), (6, 0, zt)], sw=1.3, op=.7)
            A.line([(-w + 10, 8, zt), (-2, 8, zt)], sw=1.3, op=.7)
        if i < 2:
            for cx, cy in ((-w, d), (w, d), (w, -d)):
                A.line([(cx, cy, zt), (cx, cy, zs[i + 1])], sw=.8, dash="1.5 2.5", op=.7)


def logical_properties(A):
    A.oy = 66
    A.box(-36, -36, -16, 72, 72, 3, tex="dots")
    z = -13

    def arrow(dx, dy, acc=False):
        vx, vy = -dy, dx
        r0, r1, r2 = 15, 26, 34
        pts = [(dx * r0 + vx * 3, dy * r0 + vy * 3), (dx * r1 + vx * 3, dy * r1 + vy * 3), (dx * r1 + vx * 7, dy * r1 + vy * 7),
               (dx * r2, dy * r2), (dx * r1 - vx * 7, dy * r1 - vy * 7), (dx * r1 - vx * 3, dy * r1 - vy * 3),
               (dx * r0 - vx * 3, dy * r0 - vy * 3)]
        # split the concave arrow into the shaft and the head
        A.prism(pts[:2] + pts[5:], z, 3, top="acc" if acc else "t", acc=acc, **({"fo": .3} if acc else {}))
        A.prism(pts[2:5], z, 3, top="acc" if acc else "t", acc=acc, **({"fo": .3} if acc else {}))
    arrow(-1, 0)
    arrow(0, -1)
    A.box(-11, -11, z, 22, 22, 18, tex="hatch")
    zt = z + 18
    A.line([(-5, -4, zt), (5, -4, zt)], sw=1.2)
    A.line([(-5, 1, zt), (2, 1, zt)], sw=1.2)
    A.line([(-5, 6, zt), (4, 6, zt)], sw=1.2)
    arrow(0, 1)
    arrow(1, 0, acc=True)


def container_queries(A):
    A.oy = 66
    A.poly([(-38, -30, -14), (40, -30, -14), (40, 34, -14), (-38, 34, -14)], acc=True, sw=1, dash="2.5 2.5", op=.9)
    A.box(-34, -26, -16, 66, 52, 3, tex="dots")
    z = -13
    A.poly([(-29, -21, z), (27, -21, z), (27, 21, z), (-29, 21, z)], sw=1, dash="2 2.5", op=.6)
    A.box(-16, -12, z, 26, 22, 16, tex="hatch")
    zt = z + 16
    A.box(-12, -8, zt, 10, 8, 4)
    A.line([(0, -6, zt), (6, -6, zt)], sw=1.2)
    A.line([(0, 0, zt), (4, 0, zt)], sw=1.2)
    for k in range(0, 9):
        x = -34 + k * 66 / 8
        ln = 4 if k % 2 == 0 else 2.2
        A.line([(x, 30, z - 3), (x, 30 + ln, z - 3)], sw=1)
    for k in range(0, 7):
        y = -26 + k * 52 / 6
        ln = 4 if k % 2 == 0 else 2.2
        A.line([(36, y, z - 3), (36 + ln, y, z - 3)], sw=1)
    for k in (4, 8, 12):
        A.line([(32 - k, 26, z), (32, 26 - k, z)], acc=True, sw=1.4)
    A.line([(35, 29, z), (40, 34, z)], acc=True, sw=1.3)
    A.line([(36.5, 34, z), (40, 34, z), (40, 30.5, z)], acc=True, sw=1.3)


def gradients(A):
    A.oy = 66
    w, d = 36, 22
    A.box(-w, -d, -10, 2 * w, 2 * d, 8, tex="dots")
    z = -2
    x0, x1 = -30, 30
    p0, p1 = A.P(x0, 0, z), A.P(x1, 0, z)
    gid = f"{A.id}-g"
    gdef = (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{n(p0[0])}" y1="{n(p0[1])}" x2="{n(p1[0])}" y2="{n(p1[1])}">'
            f'<stop offset="0" stop-color="{A.acc}" stop-opacity="0"/><stop offset=".55" stop-color="{A.acc}" stop-opacity=".55"/>'
            f'<stop offset="1" stop-color="{A.acc}" stop-opacity=".95"/></linearGradient>')
    A.extra = gdef
    A.poly([(x0, -10, z), (x1, -10, z), (x1, 10, z), (x0, 10, z)], fill=f"url(#{gid})", sw=1.3)
    for k in range(1, 12):
        x = x0 + k * 5
        A.line([(x, 10, z), (x, 13, z)], sw=.8, op=.6)
    for x, acc in ((x0, False), (3, True), (x1, False)):
        A.line([(x, -10, z), (x, -10, z + 16)], sw=1.1 if not acc else 1.4, acc=acc)
        dsz = 3.4 if acc else 2.6
        tx, ty = A.P(x, -10, z + 16)
        A.track(tx, ty - dsz * 1.3)
        A.path2(f"M{n(tx)},{n(ty - dsz * 1.3)}l{n(dsz)},{n(dsz * 1.3)}l{n(-dsz)},{n(dsz * 1.3)}l{n(-dsz)},{n(-dsz * 1.3)}Z",
                fill="acc" if acc else "t", fo=.9 if acc else None, acc=acc, sw=1.2)
    A.line([(x0, 18, z - 8), (x1, 18, z - 8)], sw=.9, dash="1.5 2.5", op=.7)


def transforms_3d(A):
    A.oy = 70
    w, d = 26, 18
    zg = -14
    A.poly([(-w, -d, zg), (w, -d, zg), (w, d, zg), (-w, d, zg)], sw=1.1, dash="2.5 2.5", op=.75)
    ang = math.radians(-42)
    cz = zg + 17

    def rot(x, y, z):
        return (x, y * math.cos(ang) - z * math.sin(ang), cz + y * math.sin(ang) + z * math.cos(ang))
    v = [rot(-w + 2 * w * (i & 1), -d + 2 * d * ((i >> 1) & 1), -1.5 + 3 * ((i >> 2) & 1)) for i in range(8)]
    A.line([(-w - 12, 0, cz), (-w, 0, cz)], sw=.9, dash="1 2.5", op=.7)
    A.solid(v, tex="dots")
    A.line([(w, 0, cz), (w + 14, 0, cz)], sw=.9, dash="1 2.5", op=.7)
    # content lines on the tilted face
    for yy, ln in ((-10, 30), (-3, 22), (4, 34), (11, 16)):
        A.line([rot(-w + 6, yy, 1.5), rot(-w + 6 + ln, yy, 1.5)], sw=1.1, op=.7)
    # rotation arc about the x axis, following the raised back edge
    R = d + 7
    ph = [math.pi + ang * k / 16 for k in range(17)]
    arc = [(w + 7, R * math.cos(f), cz + R * math.sin(f)) for f in ph]
    A.line([(w + 7, 0, cz), arc[0]], sw=.9, dash="1 2.5", op=.7)
    A.line(arc, acc=True, sw=1.5, dash="3 2.5")
    tx, ty = A.P(*arc[-1])
    bx, by = A.P(*arc[-3])
    ux, uy = tx - bx, ty - by
    ln = math.hypot(ux, uy)
    ux, uy = ux / ln, uy / ln
    A.path2(f"M{n(tx + ux * 3.5)},{n(ty + uy * 3.5)}L{n(tx - ux * 2.5 - uy * 3)},{n(ty - uy * 2.5 + ux * 3)}"
            f"L{n(tx - ux * 2.5 + uy * 3)},{n(ty - uy * 2.5 - ux * 3)}Z", fill="acc", acc=True, sw=1)
    # spin arc around the vertical axis on the ground
    arc2 = [(-w - 6 + 10 * math.cos(t2), 10 * math.sin(t2), zg) for t2 in [math.radians(40 + 200 * k / 16) for k in range(17)]]
    A.line(arc2, sw=1.1, dash="2 2.5", op=.8)
    A.line([(-w - 6, 0, zg), (-w - 6, 0, zg + 26)], sw=.9, dash="1 2.5", op=.7)


def native_components(A):
    A.oy = 70
    A.box(-38, -28, -18, 76, 56, 3, tex="dots")
    z = -15
    A.line([(-33, -22, z), (-12, -22, z)], sw=1.2, op=.7)
    A.line([(-33, -16, z), (-20, -16, z)], sw=1.2, op=.5)
    A.poly([(-20, -14, z), (20, -14, z), (20, 16, z), (-20, 16, z)], fill="sh", stroke=False)
    dz = 4
    for cx, cy in ((-20, 16), (20, 16), (20, -14)):
        A.line([(cx, cy, z), (cx, cy, dz)], sw=.8, dash="1.5 2.5", op=.6)
    A.box(-20, -14, dz, 40, 30, 3, tex="hatch")
    zt = dz + 3
    A.line([(-15, -9, zt), (4, -9, zt)], sw=1.5)
    A.line([(-15, -3, zt), (12, -3, zt)], sw=1.1, op=.7)
    A.line([(-15, 2, zt), (6, 2, zt)], sw=1.1, op=.7)
    A.box(-2, 7, zt, 8, 5, 1.5, sw=1.1)
    A.box(8, 7, zt, 8, 5, 1.5, fills={"t": "acc"}, top_fo=.35, acc=True, sw=1.1)
    pz = zt + 16
    A.line([(12, 9.5, zt + 1.5), (12, 9.5, pz - 1)], acc=True, sw=.9, dash="1.5 2")
    A.box(4, -8, pz, 22, 14, 2.5, acc=True, sw=1.4)
    A.poly([(9, 6, pz + 2.5), (15, 6, pz + 2.5), (12, 11, pz + 2.5)], fill="acc", fo=.8, acc=True, sw=1.1)
    A.line([(8, -3, pz + 2.5), (20, -3, pz + 2.5)], acc=True, sw=1.2)
    A.line([(8, 1, pz + 2.5), (16, 1, pz + 2.5)], acc=True, sw=1.2, op=.7)


def seed_theme(A):
    A.oy = 76
    A.box(-46, -16, -14, 92, 32, 3, tex="dots")
    z = -11
    tiles = []
    for i in range(5):
        x = -42 + i * 17.5
        h = 3 + i * 5
        tiles.append((x, h))
    dx, dy = 80, 18
    for i, (x, h) in enumerate(tiles):
        tx, ty = A.P(x + 7, 0, z + h)
        A.path2(f"M{dx},{dy + 12}L{n(tx)},{n(ty)}", acc=True, sw=.8, dash="1.5 2.5", op=.8)
    for i, (x, h) in enumerate(tiles):
        A.box(x, -7, z, 14, 14, h, fills={"t": "acc"}, top_fo=.12 + i * .2, acc=True, sw=1.3)
    A.track(dx - 8, dy - 12)
    A.track(dx + 8, dy + 12)
    A.path2(f"M{dx},{dy - 12}C{dx + 4},{dy - 5} {dx + 8},{dy} {dx + 8},{dy + 4}A8 8 0 0 1 {dx - 8},{dy + 4}"
            f"C{dx - 8},{dy} {dx - 4},{dy - 5} {dx},{dy - 12}Z", fill="acc", fo=.3, acc=True, sw=1.6)
    A.path2(f"M{dx - 4},{dy + 3}A4.5 4.5 0 0 0 {dx - 1},{dy + 8}", acc=True, sw=1.2)


def no_build(A):
    A.oy = 64
    s = 24
    A.box(-s, -s, -22, 2 * s, 2 * s, 34, tex=None)
    zt = 12
    A.poly([(-s, -4, zt), (s, -4, zt), (s, 4, zt), (-s, 4, zt)], fill="dots", sw=1)
    A.line([(s, -4, zt), (s, -4, zt - 9)], sw=1)
    A.line([(-s + 6, s, zt), (-s + 6, s, zt - 9)], sw=1, op=0)
    # flap seams
    A.line([(-s, s, zt - 3), (s, s, zt - 3)], sw=.7, op=.5)
    A.line([(s, -s, zt - 3), (s, s, zt - 3)], sw=.7, op=.5)
    # gear on the left face
    teeth, ro, ri = 8, 12, 9.5
    d = ""
    for k in range(teeth * 2):
        r = ro if k % 2 == 0 else ri
        a0 = (k - .35) * math.pi / teeth
        a1 = (k + .35) * math.pi / teeth
        for a in (a0, a1):
            d += ("M" if not d else "L") + f"{n(r * math.cos(a))} {n(r * math.sin(a))}"
    d += "Z"
    inner = f'<path d="{d}"/><circle r="4"/>'
    A.g(A.left_m(0, s, -6), inner, sw=1.4)
    A.g(A.left_m(0, s, -6), '<path d="M-15 -11L15 11"/>', acc=True, sw=2.6)
    # label lines on the right face
    A.g(A.right_m(s, 12, -12), '<path d="M0 0h12M0 4h8"/>', sw=1.1, op=.7)


def cdn(A):
    A.oy = 60
    # page on the ground
    zp = -14
    px0, px1, py0, py1 = 2, 42, -30, 10
    A.prism([(px0, py0), (px1 - 9, py0), (px1, py0 + 9), (px1, py1), (px0, py1)][::-1], zp, 2, tex="dots")
    A.line([(px1 - 9, py0, zp + 2), (px1 - 9, py0 + 9, zp + 2), (px1, py0 + 9, zp + 2)], sw=1)
    for yy, ln in ((py0 + 12, 22), (py0 + 18, 26), (py0 + 24, 16), (py0 + 30, 22)):
        A.line([(px0 + 5, yy, zp + 2), (px0 + 5 + ln, yy, zp + 2)], sw=1.1, op=.7)
    # cloud slab (radial union of circles), swept upward
    cx, cy, cz, h = -24, 10, 20, 7
    circ = [(0, 0, 13), (-13, 7, 9), (13, 5, 10), (4, -11, 10.5), (-10, -7, 8)]
    poly = []
    for k in range(48):
        t = 2 * math.pi * k / 48
        ux, uy = math.cos(t), math.sin(t)
        best = 0
        for ax, ay, r in circ:
            b = ax * ux + ay * uy
            c = ax * ax + ay * ay - r * r
            disc = b * b - c
            if disc >= 0:
                best = max(best, b + math.sqrt(disc))
        poly.append((cx + best * ux, cy + best * uy))
    # link from the cloud to the page
    lk = [(cx + 6, cy + 12, cz), (cx + 6, cy + 12, zp + 2), (14, -2, zp + 2)]
    A.line(lk, acc=True, sw=1.4, dash="3 2.5")
    for p in (lk[0], lk[-1]):
        A.ell(p[0], p[1], p[2], 1.8, fill="acc", acc=True, sw=1)
    pid = f"{A.id}-c"
    sp = A.pts([(x, y, cz) for x, y in poly])
    A.add(f'<path id="{pid}" d="M{sp}Z"{A.a(fill="r")}/>')
    for k in range(1, h):
        A.add(f'<use href="#{pid}" y="-{k}" stroke="none"/>')
    scr = [A.P(x, y, cz) for x, y in poly]
    lx = min(scr, key=lambda p: p[0])
    rx = max(scr, key=lambda p: p[0])
    A.path2(f"M{n(lx[0])},{n(lx[1])}v-{h}M{n(rx[0])},{n(rx[1])}v-{h}")
    A.poly([(x, y, cz + h) for x, y in poly], fill="t", fo=.95)
    A.poly([(x, y, cz + h) for x, y in poly], fill="dots", stroke=False)
    A.ell(cx + 6, cy + 12, cz + h, 2, fill="acc", acc=True, sw=1)


def purge(A):
    A.oy = 62
    for x, y, z in ((-4, 6, -34), (8, -4, -28)):
        A.box(x, y, z, 6, 6, 6, fills={"t": "acc"}, top_fo=.45, acc=True, sw=1.3)
    for x, y, z in ((-4, 6, -34), (8, -4, -28)):
        pass
    A.line([(-1, 9, -28), (-1, 9, -16)], acc=True, sw=.8, dash="1.5 2.5")
    A.line([(11, -1, -22), (11, -1, -14)], acc=True, sw=.8, dash="1.5 2.5")
    zr = -10
    A.cyl(0, 0, zr, 30, 5, top="t", side="l", sw=1.6)
    A.ell(0, 0, zr + 5, 25, fill="sc", sw=1.1)
    A.ell(0, 0, zr + 5, 25, fill="mesh", stroke=False)
    lat = [(-1, 0, 0), (0, -1, 0), (1, 0, 0), (0, 1, 0), (-1, -1, 1), (1, -1, 1), (-1, 1, 1), (0, 0, 1), (0, -1, 2), (-1, 0, 2.2)]
    lat.sort(key=lambda c: c[0] + c[1] + c[2] * 1.5)
    cubes = [(i * 14 - 3, j * 14 - 3, 3 + l * 12) for i, j, l in lat]
    for x, y, z in cubes:
        A.box(x, y, z, 6, 6, 6, tex="dots" if (x + y) % 3 == 0 else None, sw=1.3)


def accessibility(A):
    A.oy = 70
    w, d = 32, 24
    A.box(-w, -d, -12, 2 * w, d, 6, fills={"t": "lo"}, tex="hatch")
    A.box(-w, 0, -12, 2 * w, d, 6, fills={"t": "hi"})
    z = -6
    fam = 'font-family="system-ui,Segoe UI,Helvetica,Arial,sans-serif" font-weight="700" font-size="15" stroke="none"'
    A.g(A.top_m(-24, -6, z), f'<text {fam} fill="{A.T["s"]}">Aa</text>')
    A.g(A.top_m(-24, 18, z), f'<text {fam} fill="{A.T["s"]}" fill-opacity=".9">Aa</text>')
    A.line([(6, -14, z), (24, -14, z)], sw=1.3, op=.8)
    A.line([(6, -8, z), (18, -8, z)], sw=1.3, op=.6)
    A.line([(6, 10, z), (24, 10, z)], sw=1.3, op=.8)
    A.line([(6, 16, z), (18, 16, z)], sw=1.3, op=.6)
    bx, by, bz = 24, -18, 14
    A.line([(bx, by, z), (bx, by, bz)], acc=True, sw=.8, dash="1.5 2.5")
    A.cyl(bx, by, bz, 11, 3.5, top="t", side="l", acc=True, sw=1.5)
    A.ell(bx, by, bz + 3.5, 8, fill="acc", fo=.2, acc=True, sw=1)
    A.g(A.top_m(bx, by, bz + 3.5), '<path d="M-4.5 -.5L-1 3.5L5 -4"/>', acc=True, sw=2.4)


def responsive(A):
    A.oy = 64
    z = -12

    def device(x, y, w, d, cols, bez, accent_ix):
        A.box(x, y, z, w, d, 3, tex="dots")
        zt = z + 3
        sx0, sy0, sx1, sy1 = x + bez, y + bez, x + w - bez, y + d - bez
        A.poly([(sx0, sy0, zt), (sx1, sy0, zt), (sx1, sy1, zt), (sx0, sy1, zt)], fill="sc", sw=1.1)
        A.line([(sx0 + 2, sy0 + 3, zt), (sx1 - 2, sy0 + 3, zt)], sw=1, op=.7)
        cw = (sx1 - sx0 - 2 - (cols - 1) * 2) / cols
        rows = 2 if cols > 1 else 3
        rh = (sy1 - sy0 - 7 - (rows - 1) * 2) / rows
        k = 0
        for r in range(rows):
            for c in range(cols):
                bx = sx0 + 1 + c * (cw + 2)
                by = sy0 + 6 + r * (rh + 2)
                acc = k == accent_ix
                A.poly([(bx, by, zt), (bx + cw, by, zt), (bx + cw, by + rh, zt), (bx, by + rh, zt)],
                       fill="acc" if acc else None, fo=.45 if acc else None, acc=acc, sw=.9, op=None if acc else .75)
                k += 1
    device(-44, -34, 48, 34, 3, 3, 0)
    device(8, -30, 30, 36, 2, 3, 0)
    device(-16, 10, 18, 30, 1, 2.5, 0)


def hero_grid(theme):
    T = THEMES[theme]
    pid = f"mz-hero-grid-{theme[0]}"
    s = 16
    W = 2 * C * s
    acc, acc2 = T["cyan"], T["violet"]
    st = T["s"]
    dots = (f'<pattern id="{pid}-p" width="{n(W)}" height="{s}" patternUnits="userSpaceOnUse">'
            f'<g fill="{st}" fill-opacity=".3"><circle r="1"/><circle cx="{n(W)}" r="1"/><circle cy="{s}" r="1"/>'
            f'<circle cx="{n(W)}" cy="{s}" r="1"/><circle cx="{n(W / 2)}" cy="{s / 2}" r="1"/></g></pattern>'
            f'<radialGradient id="{pid}-r" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#fff"/>'
            f'<stop offset=".7" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
            f'<mask id="{pid}-m"><rect width="480" height="270" fill="url(#{pid}-r)"/></mask>')
    hx, hy = W / 2, s / 2

    def lp(i, j):
        return (i * hx, j * hy)
    lines = []
    # each: start lattice (i,j) with i+j even, direction (di,dj) per step, steps, color
    spec = [((6, 6), (1, 1), 7, st, .32), ((10, 18), (1, -1), 9, acc, .7), ((23, 9), (0, 2), 5, st, .3),
            ((22, 22), (1, -1), 6, st, .32), ((26, 14), (1, 1), 6, acc2, .65), ((12, 26), (1, 1), 4, st, .26),
            ((30, 4), (0, 2), 4, acc, .5)]
    for (i, j), (di, dj), k, col, op in spec:
        a = lp(i, j)
        b = lp(i + di * k, j + dj * k)
        lines.append(f'<path d="M{n(a[0])},{n(a[1])}L{n(b[0])},{n(b[1])}" stroke="{col}" stroke-opacity="{n(op)}"/>')
        for e in (a, b):
            lines.append(f'<circle cx="{n(e[0])}" cy="{n(e[1])}" r="2" fill="{col}" fill-opacity="{n(op)}" stroke="none"/>')
    # one small iso cube outline
    cxp, cyp = lp(18, 16)
    cube = (f'<path d="M{n(cxp)},{n(cyp)}l{n(hx)},{n(-hy)}l{n(hx)},{n(hy)}l{n(-hx)},{n(hy)}z'
            f'M{n(cxp)},{n(cyp)}v{s}l{n(hx)},{n(hy)}l{n(hx)},{n(-hy)}v{-s}M{n(cxp + hx)},{n(cyp + hy)}v{s}" '
            f'stroke="{st}" stroke-opacity=".45" fill="{T["l"][0]}" fill-opacity=".35"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" fill="none" preserveAspectRatio="xMidYMid slice">'
            f'<defs>{dots}</defs><g mask="url(#{pid}-m)"><rect width="480" height="270" fill="url(#{pid}-p)"/>'
            f'<g stroke-width="1.2" stroke-linecap="round">{cube}{"".join(lines)}</g></g></svg>')


SCENES = [
    ("filters", "Filters", "cyan", filters),
    ("dark-mode", "Dark mode", "violet", dark_mode),
    ("css-variables", "CSS variables", "cyan", css_variables),
    ("palette", "Palette", "violet", palette),
    ("grid-layout", "Grid layout", "cyan", grid_layout),
    ("transitions", "Transitions", "cyan", transitions),
    ("cascade-layers", "Cascade layers", "violet", cascade_layers),
    ("logical-properties", "Logical properties", "cyan", logical_properties),
    ("container-queries", "Container queries", "violet", container_queries),
    ("gradients", "Gradients", "violet", gradients),
    ("3d-transforms", "3D transforms", "violet", transforms_3d),
    ("native-components", "Native components", "cyan", native_components),
    ("seed-theme", "Seed theme", "cyan", seed_theme),
    ("no-build", "No build step", "violet", no_build),
    ("cdn", "CDN ready", "cyan", cdn),
    ("purge", "Purge unused", "cyan", purge),
    ("accessibility", "Accessibility", "cyan", accessibility),
    ("responsive", "Responsive", "violet", responsive),
]


def main():
    index = []
    for theme in THEMES:
        os.makedirs(os.path.join(OUT, theme), exist_ok=True)
    for name, title, accent, fn in SCENES:
        for theme in THEMES:
            A = Art(name, theme, accent)
            A.extra = ""
            fn(A)
            x0, y0, x1, y1 = A.bb
            k = min(144 / (x1 - x0), 102 / (y1 - y0), 1.4)
            tx, ty = 80 - k * (x0 + x1) / 2, 60 - k * (y0 + y1) / 2
            A = Art(name, theme, accent)
            A.extra = ""
            A.k = k
            fn(A)
            svg = A.svg(A.extra, f"matrix({k:.3f} 0 0 {k:.3f} {n(tx)} {n(ty)})")
            with open(os.path.join(OUT, theme, name + ".svg"), "w", encoding="utf-8", newline="\n") as f:
                f.write(svg + "\n")
        index.append({"name": name, "title": title, "dark": f"assets/art/dark/{name}.svg", "light": f"assets/art/light/{name}.svg"})
    for theme in THEMES:
        with open(os.path.join(OUT, theme, "hero-grid.svg"), "w", encoding="utf-8", newline="\n") as f:
            f.write(hero_grid(theme) + "\n")
    index.append({"name": "hero-grid", "title": "Hero grid", "dark": "assets/art/dark/hero-grid.svg", "light": "assets/art/light/hero-grid.svg"})
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(index, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
