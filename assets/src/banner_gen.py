# Generates banner.svg and banner-dark.svg from mascot.svg (run from assets/).
import re

m = open("mascot.svg", encoding="utf-8").read()
inner = re.search(r"<svg[^>]*>(.*)</svg>", m, re.S).group(1)
inner = re.sub(r"\s*<title.*?</title>\s*<desc.*?</desc>", "", inner, flags=re.S)

SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"

def banner(dark):
    bg1, bg2 = ("#141530", "#1d2150") if dark else ("#f7f9ff", "#e8edff")
    ink = "#f1f5ff" if dark else "#141530"
    sub = "#a9b3e6" if dark else "#4a5280"
    chip_bg = "#0d0e22" if dark else "#141530"
    chip_bd = "#2c3170" if dark else "#141530"
    swirl = "#2a2f6e" if dark else "#d9e1ff"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 400" width="1280" height="400" role="img" aria-labelledby="bt">
  <title id="bt">Monsoon: Utility-first CSS. No build step. Ever.</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{bg1}"/>
      <stop offset="1" stop-color="{bg2}"/>
    </linearGradient>
    <linearGradient id="oo" gradientUnits="userSpaceOnUse" x1="880" y1="0" x2="1050" y2="0">
      <stop offset="0" stop-color="#22d3ee"/>
      <stop offset=".5" stop-color="#3b5bdb"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="400" rx="24" fill="url(#bg)"/>
  <g fill="none" stroke="{swirl}" stroke-width="6" stroke-linecap="round">
    <path d="M1010 66 C1080 40 1160 58 1236 38"/>
    <path d="M1200 372 C1220 366 1240 368 1256 362"/>
    <path d="M30 360 C90 340 150 370 220 350"/>
    <path d="M1120 110 C1160 96 1200 104 1236 92"/>
  </g>
  <svg x="64" y="34" width="440" height="336" viewBox="0 0 460 352">{inner}</svg>
  <text x="544" y="196" font-family="{SANS}" font-size="132" font-weight="900" letter-spacing="-5" fill="{ink}">mons<tspan fill="url(#oo)">oo</tspan>n</text>
  <text x="550" y="250" font-family="{SANS}" font-size="34" font-weight="600" fill="{sub}">Utility-first CSS. No build step. Ever.</text>
  <g transform="translate(548 282)">
    <rect width="620" height="52" rx="12" fill="{chip_bg}" stroke="{chip_bd}" stroke-width="2"/>
    <circle cx="26" cy="26" r="6" fill="#22d3ee"/>
    <text x="46" y="33" font-family="{MONO}" font-size="19" textLength="550" fill="#c9d3ff"><tspan fill="#8b5cf6">&lt;link</tspan> <tspan fill="#22d3ee">href</tspan>=<tspan fill="#fda4af">"https://cdn.jsdelivr.net/npm/monsooncss"</tspan><tspan fill="#8b5cf6">&gt;</tspan></text>
  </g>
</svg>
'''

open("banner.svg", "w", encoding="utf-8", newline="\n").write(banner(False))
open("banner-dark.svg", "w", encoding="utf-8", newline="\n").write(banner(True))
