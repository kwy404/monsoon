# Generates mascot.svg (run from assets/). Kept for future tweaks.
streams = [
 ("#22d3ee", "M316 178 C350 176 392 176 414 162 C434 148 424 124 406 128 C392 131 394 148 408 147"),
 ("#3b5bdb", "M326 204 L392 204 M414 204 L438 204"),
 ("#8b5cf6", "M326 234 L376 234 M398 234 L438 234"),
 ("#f43f5e", "M316 260 C350 262 392 262 414 276 C434 290 424 314 406 310 C392 307 394 290 408 291"),
]
outline = "\n".join(f'    <path d="{d}"/>' for c, d in streams)
color = "\n".join(f'    <path d="{d}" stroke="{c}"/>' for c, d in streams)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 352" width="460" height="352" role="img" aria-labelledby="t d">
  <title id="t">Gale, the Monsoon mascot</title>
  <desc id="d">A friendly storm cloud blowing four colorful wind streams.</desc>
  <defs>
    <g id="cloud">
      <circle cx="84" cy="204" r="56"/>
      <circle cx="148" cy="150" r="72"/>
      <circle cx="226" cy="158" r="58"/>
      <circle cx="268" cy="214" r="44"/>
      <rect x="40" y="180" width="262" height="98" rx="49"/>
    </g>
    <clipPath id="cloud-clip"><use href="#cloud"/></clipPath>
  </defs>
  <g fill="none" stroke="#141530" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
{outline}
  </g>
  <polygon points="110,262 86,306 108,306 98,342 148,290 126,290 140,262" fill="#22d3ee" stroke="#141530" stroke-width="8" stroke-linejoin="round"/>
  <use href="#cloud" fill="#141530" stroke="#141530" stroke-width="16" stroke-linejoin="round"/>
  <use href="#cloud" fill="#f1f5ff"/>
  <g clip-path="url(#cloud-clip)">
    <ellipse cx="170" cy="296" rx="180" ry="46" fill="#3b5bdb" opacity=".2"/>
    <ellipse cx="124" cy="112" rx="30" ry="12" fill="#ffffff" transform="rotate(-20 124 112)"/>
  </g>
  <g fill="none" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">
{color}
  </g>
  <g fill="#141530">
    <ellipse cx="184" cy="200" rx="13" ry="17"/>
    <ellipse cx="236" cy="198" rx="13" ry="17"/>
    <ellipse cx="278" cy="232" rx="10" ry="11"/>
  </g>
  <ellipse cx="278" cy="234" rx="5" ry="5.5" fill="#f43f5e"/>
  <g fill="#ffffff">
    <circle cx="189" cy="193" r="5"/>
    <circle cx="241" cy="191" r="5"/>
  </g>
  <g fill="none" stroke="#141530" stroke-width="7" stroke-linecap="round">
    <path d="M168 170 Q181 165 196 170"/>
    <path d="M222 162 Q236 152 252 160"/>
  </g>
  <g fill="#f43f5e" opacity=".42">
    <ellipse cx="160" cy="232" rx="16" ry="10"/>
    <ellipse cx="246" cy="234" rx="12" ry="8"/>
  </g>
</svg>
'''
open("mascot.svg", "w", newline="\n").write(svg)
