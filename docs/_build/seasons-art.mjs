// Seasonal art for the Monsoon site, written as SVG into assets/seasons/<id>/:
//   mo-light.svg, mo-dark.svg      Mo in a costume, drawn over the mascot files
//   accent-light.svg, accent-dark.svg   a garland for the hero
//   icon-<name>.svg                three icons in the site's line style
// Run by the docs build; the files are committed so they can be reviewed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const O = '#141530';
const line = (attrs) => `stroke="${O}" stroke-width="${attrs}" stroke-linejoin="round" stroke-linecap="round"`;
// Mo's eyes, redrawn on top of the carnival mask.
const EYES = `<g transform="translate(184 222)"><ellipse cx="-38" cy="2" rx="17" ry="21" fill="${O}"/><circle cx="-32" cy="-6" r="7" fill="#fff"/><circle cx="-44" cy="10" r="3.2" fill="#fff"/><ellipse cx="38" cy="2" rx="17" ry="21" fill="${O}"/><circle cx="44" cy="-6" r="7" fill="#fff"/><circle cx="32" cy="10" r="3.2" fill="#fff"/></g>`;
const flake = (x, y, r, c) => `<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="4" stroke-linecap="round"><path d="M0 ${-r}V${r}M${-r * 0.87} ${-r / 2}L${r * 0.87} ${r / 2}M${-r * 0.87} ${r / 2}L${r * 0.87} ${-r / 2}"/></g>`;
const burst = (x, y, r, c) => `<g transform="translate(${x} ${y})" stroke="${c}" stroke-width="5" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const p = (k) => `${(Math.cos(a) * r * k).toFixed(1)} ${(Math.sin(a) * r * k).toFixed(1)}`;
  return `<path d="M${p(0.45)}L${p(1)}"/>`;
}).join('')}<circle r="5" fill="${c}" stroke="none"/></g>`;
const heart = (x, y, s, fill, sw = 7) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 30 C-40 0 -40 -40 -12 -40 C-4 -40 0 -32 0 -28 C0 -32 4 -40 12 -40 C40 -40 40 0 0 30 Z" fill="${fill}" stroke="${O}" stroke-width="${sw / s}" stroke-linejoin="round"/>`;
const bat = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 C6 -12 14 -12 22 -18 C20 -8 26 -2 34 0 C24 2 18 8 14 14 C10 8 4 6 0 10 C-4 6 -10 8 -14 14 C-18 8 -24 2 -34 0 C-26 -2 -20 -8 -22 -18 C-14 -12 -6 -12 0 -6 Z" fill="#3b2f73" stroke="${O}" stroke-width="${4 / s}" stroke-linejoin="round"/>`;

/** Costume pieces, in the mascot's own coordinates (head center 184 222). */
const COSTUME = {
  halloween: `
  ${bat(64, 64, 1.1)}${bat(404, 196, 0.8)}
  <path d="M122 144 L170 40 Q176 30 186 38 L240 144 Z" fill="#3b2f73" ${line(8)}/>
  <path d="M132 124 L230 124 L238 142 L124 142 Z" fill="#f59e0b" ${line(6)}/>
  <ellipse cx="180" cy="146" rx="92" ry="15" fill="#3b2f73" ${line(8)}/>
  <g transform="translate(62 322)">
    <path d="M0 -36 q4 -12 14 -14" fill="none" stroke="#3f7a3a" stroke-width="7" stroke-linecap="round"/>
    <ellipse rx="40" ry="32" fill="#f97316" ${line(7)}/>
    <path d="M-14 -30 q-10 30 0 62 M14 -30 q10 30 0 62" fill="none" stroke="#c2410c" stroke-width="4"/>
    <ellipse rx="40" ry="32" fill="none" ${line(7)}/>
    <path d="M-22 -8 l8 -10 l8 10 Z M6 -8 l8 -10 l8 10 Z M-20 10 q20 14 40 0 q-20 6 -40 0 Z" fill="#fde68a"/>
  </g>`,
  christmas: `
  ${flake(40, 60, 14, '#a5b4fc')}${flake(414, 190, 11, '#a5b4fc')}${flake(372, 360, 9, '#a5b4fc')}
  <path d="M120 140 Q150 64 226 72 Q258 86 260 140 Z" fill="#c0392b" ${line(8)}/>
  <path d="M150 96 Q104 66 84 104" fill="none" stroke="${O}" stroke-width="30" stroke-linecap="round"/>
  <path d="M150 96 Q104 66 84 104" fill="none" stroke="#c0392b" stroke-width="16" stroke-linecap="round"/>
  <circle cx="82" cy="108" r="15" fill="#f8fafc" ${line(6)}/>
  <rect x="106" y="132" width="164" height="26" rx="13" fill="#f8fafc" ${line(7)}/>
  <path d="M122 296 Q184 324 248 296 L252 320 Q184 348 116 320 Z" fill="#c0392b" ${line(7)}/>
  <path d="M196 322 L214 392 L186 396 L180 328 Z" fill="#c0392b" ${line(7)}/>
  <path d="M146 312 l4 -14 M176 318 l2 -14 M206 318 l-2 -14 M232 310 l-4 -12 M190 350 l22 -4 M194 372 l22 -4" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>`,
  carnival: `
  <g fill-opacity=".9">${[[40, 60, '#f43f5e', 20], [70, 120, '#22d3ee', -30], [26, 190, '#fbbf24', 45], [406, 196, '#8b5cf6', 15], [380, 262, '#22d3ee', -40], [420, 330, '#f43f5e', 30]].map(([x, y, c, r]) => `<rect x="${x}" y="${y}" width="16" height="9" rx="2" fill="${c}" transform="rotate(${r} ${x} ${y})" stroke="${O}" stroke-width="3"/>`).join('')}</g>
  <path d="M240 210 Q262 176 250 146 Q276 168 268 214 Z" fill="#f43f5e" ${line(5)}/>
  <path d="M244 214 Q284 196 292 166 Q300 200 262 226 Z" fill="#fbbf24" ${line(5)}/>
  <path d="M126 214 Q150 188 184 206 Q218 188 242 214 Q240 248 210 250 Q192 248 184 234 Q176 248 158 250 Q128 248 126 214 Z" fill="#7c3aed" ${line(7)}/>
  <path d="M140 214 q12 -8 24 -2 M204 212 q12 -6 24 2" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
  ${EYES}`,
  junina: `
  <path d="M8 44 Q80 70 150 30" fill="none" stroke="${O}" stroke-width="3"/>
  ${[[24, 50, '#f43f5e'], [52, 58, '#fbbf24'], [80, 60, '#22d3ee'], [108, 54, '#8b5cf6'], [134, 42, '#10b981']].map(([x, y, c]) => `<path d="M${x - 10} ${y - 2} L${x + 10} ${y - 4} L${x + 9} ${y + 22} L${x} ${y + 14} L${x - 8} ${y + 22} Z" fill="${c}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`).join('')}
  <ellipse cx="184" cy="146" rx="114" ry="20" fill="#e9c46a" ${line(8)}/>
  <path d="M132 144 Q136 92 184 90 Q232 92 236 144 Z" fill="#e9c46a" ${line(8)}/>
  <path d="M134 126 Q184 116 234 126 L236 140 Q184 132 132 140 Z" fill="#c0392b" ${line(5)}/>
  <path d="M150 104 l8 16 M172 96 l4 18 M198 96 l-2 18 M220 104 l-8 16 M90 144 l12 6 M268 150 l14 -4" stroke="#b08530" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(52 404)">
    <path d="M-30 12 L30 -2 M-30 -2 L30 12" stroke="#7c4a24" stroke-width="12" stroke-linecap="round"/>
    <path d="M0 2 C-22 -8 -16 -30 -6 -40 C-6 -28 2 -26 4 -36 C14 -24 22 -10 0 2 Z" fill="#f97316" ${line(5)}/>
    <path d="M0 -2 C-8 -8 -6 -18 0 -24 C4 -16 8 -10 0 -2 Z" fill="#fde68a"/>
  </g>`,
  valentine: `
  <path d="M76 286 Q50 236 72 176" fill="none" stroke="${O}" stroke-width="3"/>
  ${heart(72, 140, 1, '#f43f5e')}
  <path d="M52 116 q6 -8 14 -8" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
  ${heart(404, 210, 0.42, '#fb7185')}${heart(382, 318, 0.32, '#fda4af')}`,
  easter: `
  <path d="M142 150 Q116 60 140 36 Q164 48 162 146 Z" fill="#fff4e6" ${line(8)}/>
  <path d="M146 136 Q132 76 142 56 Q152 66 152 136 Z" fill="#f9a8d4"/>
  <path d="M206 146 Q204 48 230 38 Q250 64 228 152 Z" fill="#fff4e6" ${line(8)}/>
  <path d="M214 136 Q214 70 228 58 Q236 80 224 140 Z" fill="#f9a8d4"/>
  <path d="M120 156 Q184 124 248 156" fill="none" stroke="${O}" stroke-width="16" stroke-linecap="round"/>
  <path d="M120 156 Q184 124 248 156" fill="none" stroke="#f9a8d4" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="50" cy="294" rx="14" ry="18" fill="#a5b4fc" ${line(5)}/>
  <ellipse cx="78" cy="290" rx="14" ry="18" fill="#fde68a" ${line(5)}/>
  <ellipse cx="104" cy="296" rx="13" ry="17" fill="#f9a8d4" ${line(5)}/>
  <path d="M32 278 Q72 222 118 280" fill="none" stroke="${O}" stroke-width="6"/>
  <path d="M28 302 L124 302 L112 350 L40 350 Z" fill="#c08a4a" ${line(7)}/>
  <path d="M36 318 h80 M44 334 h66" stroke="#8a5a2b" stroke-width="4"/>`,
  newyear: `
  ${burst(62, 70, 34, '#fbbf24')}${burst(406, 210, 26, '#22d3ee')}${burst(388, 336, 16, '#f43f5e')}
  <path d="M150 144 L184 46 L218 144 Z" fill="#8b5cf6" ${line(8)}/>
  <path d="M164 104 L204 104 M156 126 L212 126 M174 76 L194 76" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <circle cx="184" cy="44" r="11" fill="#fbbf24" ${line(5)}/>
  <path d="M76 288 L40 232" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
  <g transform="translate(38 226)" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"><path d="M0 -14V14M-14 0H14M-10 -10L10 10M-10 10L10 -10"/></g>`,
};

/** A garland across the hero: a string with motifs hanging from it. */
function accent(id, dark) {
  const W = 640;
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 0.5) / 9;
    // Quadratic curve 0,18 -> 320,78 -> 640,18
    const x = (1 - t) ** 2 * 0 + 2 * (1 - t) * t * 320 + t * t * W;
    const y = (1 - t) ** 2 * 18 + 2 * (1 - t) * t * 78 + t * t * 18;
    return [x, y];
  });
  const ink = dark ? '#c7cbe8' : '#3b3f66';
  const soft = (c) => (dark ? c : c);
  const pal = {
    halloween: ['#f97316', '#7c3aed', '#f59e0b'],
    christmas: ['#c0392b', '#d4a017', '#2f855a'],
    carnival: ['#f43f5e', '#22d3ee', '#fbbf24', '#8b5cf6'],
    junina: ['#f43f5e', '#fbbf24', '#22d3ee', '#10b981', '#8b5cf6'],
    valentine: ['#f43f5e', '#fb7185', '#fda4af'],
    easter: ['#a5b4fc', '#fde68a', '#f9a8d4', '#86efac'],
    newyear: ['#fbbf24', '#22d3ee', '#f8fafc'],
  }[id];
  const motif = (x, y, i) => {
    const c = soft(pal[i % pal.length]);
    const s = `stroke="${ink}" stroke-width="2"`;
    switch (id) {
      case 'halloween':
        return i % 2 ? `<path transform="translate(${x} ${y + 18}) scale(.55)" d="M0 -6 C6 -12 14 -12 22 -18 C20 -8 26 -2 34 0 C24 2 18 8 14 14 C10 8 4 6 0 10 C-4 6 -10 8 -14 14 C-18 8 -24 2 -34 0 C-26 -2 -20 -8 -22 -18 C-14 -12 -6 -12 0 -6 Z" fill="${dark ? '#8b7fd6' : '#3b2f73'}"/>` : `<path d="M${x} ${y}v8" ${s}/><ellipse cx="${x}" cy="${y + 20}" rx="13" ry="11" fill="#f97316" ${s}/><path d="M${x} ${y + 9}v-3" stroke="#3f7a3a" stroke-width="3"/>`;
      case 'christmas':
        return `<path d="M${x} ${y}v10" ${s}/><rect x="${x - 4}" y="${y + 8}" width="8" height="5" fill="${ink}"/><circle cx="${x}" cy="${y + 24}" r="11" fill="${c}" ${s}/><path d="M${x - 5} ${y + 20}q3 -3 7 -2" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/>`;
      case 'carnival':
        return `<path d="M${x} ${y}q8 14 0 26 q-8 12 0 24" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><rect x="${x + 10}" y="${y + 30}" width="9" height="5" rx="1" fill="${pal[(i + 1) % pal.length]}" transform="rotate(30 ${x + 10} ${y + 30})"/>`;
      case 'junina':
        return `<path d="M${x - 14} ${y - 2}L${x + 14} ${y + 2}L${x + 12} ${y + 32}L${x} ${y + 22}L${x - 12} ${y + 30}Z" fill="${c}" ${s}/>`;
      case 'valentine':
        return `<path d="M${x} ${y}v6" ${s}/><path transform="translate(${x} ${y + 20}) scale(.32)" d="M0 30 C-40 0 -40 -40 -12 -40 C-4 -40 0 -32 0 -28 C0 -32 4 -40 12 -40 C40 -40 40 0 0 30 Z" fill="${c}" stroke="${ink}" stroke-width="6"/>`;
      case 'easter':
        return `<path d="M${x} ${y}v6" ${s}/><ellipse cx="${x}" cy="${y + 20}" rx="10" ry="13" fill="${c}" ${s}/><path d="M${x - 9} ${y + 20}q4.5 -4 9 0t9 0" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
      default:
        return `<path d="M${x} ${y}v6" ${s}/><path d="M${x - 5} ${y + 6}h10l-2 4h-6z" fill="${ink}"/><ellipse cx="${x}" cy="${y + 19}" rx="7" ry="10" fill="${c}" ${s}/><circle cx="${x}" cy="${y + 19}" r="16" fill="${c}" opacity=".18"/>`;
    }
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 130" width="${W}" height="130" aria-hidden="true"><path d="M0 18 Q320 78 640 18" fill="none" stroke="${ink}" stroke-width="2" stroke-opacity=".7"/>${pts.map(([x, y], i) => motif(+x.toFixed(1), +y.toFixed(1), i)).join('')}</svg>\n`;
}

/** Icons in the site's line style: 24 box, stroke currentColor, one accent part. */
const ICONS = {
  halloween: {
    pumpkin: '<path d="M12 6c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7z"/><path d="M12 6c-2 2-2.5 4.5-2.5 7s.5 5 2.5 7M12 6c2 2 2.5 4.5 2.5 7s-.5 5-2.5 7"/><path d="M12 6c0-1.5.6-2.6 2-3" style="stroke:var(--icon-accent,#f97316)"/>',
    bat: '<path d="M12 9c1.5-1.5 3.5-1.5 5-3 0 2 1.5 3.5 4 4-2.5.5-4 2-5 4-1-1.5-2.5-2-4-1-1.5-1-3-.5-4 1-1-2-2.5-3.5-5-4 2.5-.5 4-2 4-4 1.5 1.5 3.5 1.5 5 3z"/><path d="M11 10.5h.01M13 10.5h.01" style="stroke:var(--icon-accent,#f97316)"/>',
    ghost: '<path d="M6 20V10a6 6 0 0 1 12 0v10l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z"/><path d="M10 10h.01M14 10h.01" style="stroke:var(--icon-accent,#f97316)"/>',
  },
  christmas: {
    snowflake: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.5 12 6l2-1.5M10 19.5 12 18l2 1.5" style="stroke:var(--icon-accent,#38bdf8)"/>',
    tree: '<path d="M12 3 6 11h3l-4 6h14l-4-6h3z"/><path d="M12 17v4" style="stroke:var(--icon-accent,#c0392b)"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-1-3-5-4-5-1.5S12 9 12 9zm0 0c1-3 5-4 5-1.5S12 9 12 9z" style="stroke:var(--icon-accent,#c0392b)"/>',
  },
  carnival: {
    mask: '<path d="M3 9c3-2 6-1 9 1 3-2 6-3 9-1 0 5-2 7-5 7-2 0-3-1.5-4-3-1 1.5-2 3-4 3-3 0-5-2-5-7z"/><path d="M7 11.5h2M15 11.5h2" style="stroke:var(--icon-accent,#8b5cf6)"/>',
    confetti: '<path d="M4 20 9 7l8 8z"/><path d="M14 4v2M19 9h2M17 5l1.5-1.5M20 13l1 1M11 3l.5 1" style="stroke:var(--icon-accent,#f43f5e)"/>',
    streamer: '<path d="M4 4c6 0 2 6 8 6s2 6 8 6"/><path d="M4 12c4 0 3 4 7 4M14 4c3 0 2 3 5 3" style="stroke:var(--icon-accent,#22d3ee)"/>',
  },
  junina: {
    bonfire: '<path d="M4 20 20 16M4 16l16 4"/><path d="M12 15c-3-1-3.5-4-1.5-7 0 2 1.5 2 2 0 2.5 2 3 5-.5 7z" style="stroke:var(--icon-accent,#f97316)"/>',
    flags: '<path d="M2 5c6 3 14 3 20 0"/><path d="M5 6.3v6l2-1.5 2 1.5V7.3M15 7.3v5l2-1.5 2 1.5V6.3" style="stroke:var(--icon-accent,#f43f5e)"/>',
    corn: '<path d="M12 3c-3 0-4 4-4 8s1 7 4 7 4-3 4-7-1-8-4-8z"/><path d="M10 8h4M10 11h4M10 14h4M8 18c-2 1-3 2-3 3M16 18c2 1 3 2 3 3" style="stroke:var(--icon-accent,#eab308)"/>',
  },
  valentine: {
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M8.5 9.5a1.6 1.6 0 0 1 1.5-1.5" style="stroke:var(--icon-accent,#f43f5e)"/>',
    letter: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3 7 9 6 9-6"/><path d="M12 16.5s-2-1.2-2-2.6a1 1 0 0 1 2-.6 1 1 0 0 1 2 .6c0 1.4-2 2.6-2 2.6z" style="stroke:var(--icon-accent,#f43f5e)"/>',
    balloon: '<path d="M12 15s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 18 7c0 4.5-6 8-6 8z"/><path d="M12 15c-1 2 1 3 0 6" style="stroke:var(--icon-accent,#f43f5e)"/>',
  },
  easter: {
    egg: '<path d="M12 3c-3.5 0-6 5-6 10a6 6 0 0 0 12 0c0-5-2.5-10-6-10z"/><path d="M6.5 12.5l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 1 .8" style="stroke:var(--icon-accent,#ec4899)"/>',
    bunny: '<path d="M9 10C8 6 8 3 9.5 3S12 6 12 9M15 10c1-4 1-7-.5-7S12 6 12 9"/><circle cx="12" cy="15" r="5.5"/><path d="M10.5 14h.01M13.5 14h.01M11.3 16.5h1.4" style="stroke:var(--icon-accent,#ec4899)"/>',
    flower: '<circle cx="12" cy="10" r="2"/><path d="M12 8c-1-3 2-5 2-2.2M14 10c3-1 5 2 2.2 2M12 12c1 3-2 5-2 2.2M10 10c-3 1-5-2-2.2-2"/><path d="M12 12v9M12 17c2-2 4-2 5-1" style="stroke:var(--icon-accent,#22c55e)"/>',
  },
  newyear: {
    firework: '<path d="M12 12v9"/><path d="M12 3v3M12 12l-4-4M12 12l4-4M5 12h3M16 12h3M7 5l2 2M17 5l-2 2" style="stroke:var(--icon-accent,#eab308)"/>',
    clock: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2"/><path d="M9 3h6M12 3v3" style="stroke:var(--icon-accent,#eab308)"/>',
    star: '<path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.4 6.6 19.4l1.2-6L3.4 9.3l6-.7z"/><path d="M19 3v3M17.5 4.5h3" style="stroke:var(--icon-accent,#eab308)"/>',
  },
};
export const SEASON_ICONS = Object.fromEntries(Object.entries(ICONS).map(([id, set]) => [id, Object.keys(set)]));

const svgIcon = (name, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><title>${name}</title>${body}</svg>\n`;

const LABEL = { newyear: 'with a party hat, a sparkler and fireworks', carnival: 'in a carnival mask with feathers and confetti', easter: 'with bunny ears and a basket of painted eggs', valentine: 'holding a heart balloon', junina: 'in a straw hat, with paper flags and a small bonfire', halloween: 'in a witch hat, holding a carved pumpkin, with two bats', christmas: 'in a red hat and scarf, with snowflakes' };

/** Writes every season's art into assets/seasons/<id>/. Returns the ids. */
export function writeSeasonArt(root) {
  const base = { light: readFileSync(join(root, 'assets/mascot.svg'), 'utf8'), dark: readFileSync(join(root, 'assets/mascot-dark.svg'), 'utf8') };
  for (const id of Object.keys(COSTUME)) {
    const dir = join(root, 'assets/seasons', id);
    mkdirSync(dir, { recursive: true });
    for (const [mode, src] of Object.entries(base)) {
      const svg = src
        .replace(/<title id="t">[^<]*<\/title>/, `<title id="t">Mo, the Monsoon mascot, ${LABEL[id]}</title>`)
        .replace(/<desc id="d">[^<]*<\/desc>/, `<desc id="d">The red panda in a raincoat with the colorful umbrella, ${LABEL[id]}.</desc>`)
        .replace(/<\/svg>\s*$/, mode === 'dark'
          // The dark mascot has a light halo, so the costume gets one too.
          ? `<filter id="halo" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#e6e9f5"/><feComposite in2="d" operator="in" result="h"/><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter><g class="costume" filter="url(#halo)">${COSTUME[id]}\n</g>\n</svg>\n`
          : `<g class="costume">${COSTUME[id]}\n</g>\n</svg>\n`);
      writeFileSync(join(dir, `mo-${mode}.svg`), svg);
      writeFileSync(join(dir, `accent-${mode}.svg`), accent(id, mode === 'dark'));
    }
    for (const [name, body] of Object.entries(ICONS[id])) writeFileSync(join(dir, `icon-${name}.svg`), svgIcon(name, body));
  }
  return Object.keys(COSTUME);
}
export const SEASON_LABEL = LABEL;
