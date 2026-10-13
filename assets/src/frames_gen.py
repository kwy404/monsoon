# Builds src/preview-demo.html: demo.svg frozen at several timestamps (for review only).
import sys
svg = open("demo.svg", encoding="utf-8").read()
times = [float(x) for x in sys.argv[1:]] or [1.2, 3.0, 6.0, 8.5, 11.0, 14.0]
css = "".join(f".f{i} *{{animation-delay:-{t}s!important;animation-play-state:paused!important}}" for i, t in enumerate(times))
body = "".join(f'<div class="f{i}"><p>t={t}s</p>{svg}</div>' for i, t in enumerate(times))
open("src/preview-demo.html", "w", encoding="utf-8").write(
    f'<!doctype html><html><head><meta charset="utf-8"><style>body{{margin:0;background:#fff;display:grid;grid-template-columns:1fr 1fr;gap:6px}}p{{margin:0;font:12px sans-serif}}svg{{width:100%;height:auto;display:block}}{css}</style></head><body>{body}</body></html>')
