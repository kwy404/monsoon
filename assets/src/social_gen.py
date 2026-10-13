# Generates src/social.html (1280x640) and src/og.html (1200x630) for Edge headless screenshots.
import re

def icon(name, color="#c9d3ff", accent="#22d3ee"):
    s = open(f"icons/{name}.svg", encoding="utf-8").read()
    s = re.sub(r"<title>.*?</title>", "", s)
    s = s.replace("currentColor", color).replace("var(--icon-accent,#8b5cf6)", accent)
    return s.replace('width="24" height="24"', 'width="22" height="22"')

PILLS = [
    ("no-build", "No build step"),
    ("seed-theme", "Theme from one --seed"),
    ("dark-mode", "Auto dark mode"),
    ("container-queries", "Container queries"),
    ("familiar-classes", "Readable class names"),
    ("accessibility", "Accessible contrast"),
]

def page(w, h, scale):
    pills = "".join(f'<span class="pill">{icon(n)}{t}</span>' for n, t in PILLS)
    return f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Monsoon social card</title>
<style>
  * {{ box-sizing: border-box; margin: 0; }}
  html, body {{ width: {w}px; height: {h}px; overflow: hidden; }}
  body {{
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #f1f5ff;
    background:
      radial-gradient(circle at 18% 30%, rgba(59,91,219,.55), transparent 42%),
      radial-gradient(circle at 92% 95%, rgba(139,92,246,.45), transparent 40%),
      radial-gradient(circle at 70% 0%, rgba(34,211,238,.18), transparent 35%),
      #141530;
    position: relative;
  }}
  .wrap {{ position: absolute; inset: 0; transform-origin: 0 0; transform: scale({scale}); width: 1280px; height: 640px;
          display: flex; align-items: center; padding: 0 64px 0 40px; gap: 28px; }}
  .mascot {{ width: 470px; flex: none; filter: drop-shadow(0 18px 30px rgba(0,0,0,.35)); }}
  .txt {{ flex: 1; min-width: 0; }}
  h1 {{ font-size: 142px; font-weight: 900; letter-spacing: -6px; line-height: .9; }}
  h1 .oo {{ background: linear-gradient(90deg, #22d3ee, #3b5bdb 50%, #8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }}
  .tag {{ font-size: 38px; font-weight: 700; color: #c9d3ff; margin-top: 18px; letter-spacing: -.5px; }}
  .chip {{ display: inline-flex; align-items: center; gap: 12px; margin-top: 28px; padding: 14px 20px; border-radius: 14px;
          background: #0b0c1f; border: 2px solid #2c3170; font: 21px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #c9d3ff; }}
  .chip i {{ width: 10px; height: 10px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 12px #22d3ee; }}
  .t {{ color: #fb7185; }} .a {{ color: #22d3ee; }} .s {{ color: #c4b5fd; }}
  .pills {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; max-width: 690px; }}
  .pill {{ display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 11px; border-radius: 999px;
          background: rgba(241,245,255,.07); border: 1.5px solid rgba(201,211,255,.18); font-size: 18px; font-weight: 600; color: #e3e8ff; }}
  .swirl {{ position: absolute; inset: 0; }}
</style></head>
<body>
<svg class="swirl" viewBox="0 0 1280 640" width="{w}" height="{h}" preserveAspectRatio="none" fill="none" stroke="#2a2f6e" stroke-width="6" stroke-linecap="round">
  <path d="M960 70 C1040 40 1140 64 1236 38"/><path d="M1080 120 C1130 104 1190 112 1240 98"/>
  <path d="M40 590 C120 566 200 600 300 574"/><path d="M1020 600 C1090 580 1170 610 1250 584"/>
</svg>
<div class="wrap">
  <img class="mascot" src="../mascot.svg" alt="">
  <div class="txt">
    <h1>mons<span class="oo">oo</span>n</h1>
    <p class="tag">Utility-first CSS. No build step. Ever.</p>
    <div class="chip"><i></i><span><span class="t">&lt;link</span> <span class="a">href</span>=<span class="s">"https://cdn.jsdelivr.net/npm/monsooncss"</span><span class="t">&gt;</span></span></div>
    <div class="pills">{pills}</div>
  </div>
</div>
</body></html>
'''

open("src/social.html", "w", encoding="utf-8", newline="\n").write(page(1280, 640, 1))
# og: 1200x630, scale the 1280x640 layout to fit width and center vertically
sc = 1200 / 1280
og = page(1200, 630, sc).replace("inset: 0; transform-origin: 0 0;", f"left: 0; top: {(630 - 640 * sc) / 2:.1f}px; transform-origin: 0 0;")
open("src/og.html", "w", encoding="utf-8", newline="\n").write(og)
