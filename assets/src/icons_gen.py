# Generates icons/*.svg plus icons/light/*.svg and icons/dark/*.svg (run from assets/).
# 24px grid, 2px stroke, round caps.
# icons/*.svg: body uses currentColor; accent parts use var(--icon-accent) with a violet
# fallback. Used inline by the docs site, where the page sets both colors.
# icons/light and icons/dark: fixed colors for <img> and <picture> in the README, where
# currentColor would render black. light is for white pages, dark for #0d1117 pages.
import os

THEMES = {
    "": ("currentColor", "var(--icon-accent,#8b5cf6)"),
    "light": ("#1e2240", "#8b5cf6"),
    "dark": ("#e6e9ff", "#b9a1ff"),
}


def shapes(fg, accent):
    A = f'style="stroke:{accent}"'
    AF = f'style="fill:{accent}" stroke="none"'
    return {
        "no-build": f'''<path d="M12 3.5 19.5 7.7v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.5 7.7 12 12l7.5-4.3M12 12v8.5"/><path d="M3 3l18 18" {A}/>''',
        "cdn": f'''<path d="M7 19a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.7 9.1 5 5 0 0 1 17 19z"/><path d="M12 10.5v5.5M9.5 13.5 12 16l2.5-2.5" {A}/>''',
        "utility-classes": f'''<rect x="3" y="3" width="11" height="4.5" rx="2.25"/><rect x="3" y="9.75" width="18" height="4.5" rx="2.25" {A}/><rect x="3" y="16.5" width="14" height="4.5" rx="2.25"/>''',
        "seed-theme": f'''<path d="M12 21v-9"/><path d="M12 14C12 10.5 9.5 8 5 8c0 4 2.5 6 7 6z"/><path d="M12 12c0-4 2.8-7.5 7.5-7.5 0 4.5-3 7.5-7.5 7.5z" {A}/><path d="M7 21h10"/>''',
        "dark-mode": f'''<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="{fg}"/>''',
        "container-queries": f'''<rect x="2.5" y="3" width="19" height="12.5" rx="2"/><rect x="5.5" y="6" width="7" height="6.5" rx="1" {A}/><path d="M4 20h16M6 18l-2 2 2 2M18 18l2 2-2 2"/>''',
        "tiny-size": f'''<path d="M3.5 3.5l5 5M8.5 4.5v4h-4M20.5 3.5l-5 5M15.5 4.5v4h4M3.5 20.5l5-5M4.5 15.5h4v4M20.5 20.5l-5-5M19.5 15.5h-4v4"/><circle cx="12" cy="12" r="1.6" {AF}/>''',
        "purge": f'''<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/><path d="M6.3 8h11.4" {A}/>''',
        "accessibility": f'''<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="7.3" r="1.5" {AF}/><path d="M7.5 10.2 12 11l4.5-.8M12 11v3.2l-2.6 4M12 14.2l2.6 4"/>''',
        "familiar-classes": f'''<g transform="rotate(-45 12 12)"><rect x="2.5" y="8.5" width="11" height="7" rx="3.5"/><rect x="10.5" y="8.5" width="11" height="7" rx="3.5" {A}/></g>''',
        "variants": f'''<path d="M12 3 21 8l-9 5-9-5z" {A}/><path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>''',
        "framework-agnostic": f'''<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><circle cx="17.25" cy="6.75" r="3.75"/><path d="M6.75 13.5 10.5 21H3z"/><path d="M17.25 13.5V21M13.5 17.25H21" {A}/>''',
    }


for theme, (fg, accent) in THEMES.items():
    folder = os.path.join("icons", theme) if theme else "icons"
    os.makedirs(folder, exist_ok=True)
    for name, body in shapes(fg, accent).items():
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" '
               f'stroke="{fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
               f'<title>{name.replace("-", " ")}</title>{body}</svg>\n')
        open(os.path.join(folder, f"{name}.svg"), "w", newline="\n").write(svg)

icons = shapes(*THEMES[""])

# preview
def cells(theme):
    return "".join(f'<figure><img src="../icons/{theme}/{n}.svg"><img class="s" src="../icons/{theme}/{n}.svg"><figcaption>{n}</figcaption></figure>' for n in icons)


html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;font:12px sans-serif}} section{{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:16px}}
figure{{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}} img{{width:72px;height:72px}} img.s{{width:24px;height:24px}}
.l{{background:#fff;color:#141530}} .d{{background:#0d1117;color:#ccc}}
</style></head><body><section class="l">{cells("light")}</section><section class="d">{cells("dark")}</section></body></html>'''
open("src/preview-icons.html", "w", newline="\n").write(html)
