// Phone number with a country picker: a searchable list of countries with
// flags and dial codes, formatting as you type, and the full number in E.164
// (+15550100123) for the form. Without the script the native select and the
// tel input still work.
//
//   <div class="phone-input" data-m-auth-phone data-m-auth-phone-name="phone_e164">
//     <select class="phone-input-select select" name="country" aria-label="Country">
//       <option value="US">United States (+1)</option> ...
//     </select>
//     <input class="phone-input-field input" type="tel" name="phone" autocomplete="tel-national" aria-label="Phone number">
//   </div>
//
// Options: -name (adds a hidden input with the E.164 number), -countries
// (comma separated ISO codes to list, every known country by default).
// Fires monsoon:auth-phone with { country, dial, national, e164, valid }.
import { define, emit } from '../core.mjs';
import { expose, h, notify, uid } from './auth-util.mjs';

// Simple flags: stripes and a few shapes, 24 by 16. Countries without one show their code.
const H = (...c) => c.map((f, i) => `<rect y="${(16 / c.length) * i}" width="24" height="${16 / c.length + 0.01}" fill="${f}"/>`).join('');
const V = (...c) => c.map((f, i) => `<rect x="${(24 / c.length) * i}" width="${24 / c.length + 0.01}" height="16" fill="${f}"/>`).join('');
const US = '<rect width="24" height="16" fill="#b22234"/>'
  + [1, 3, 5, 7, 9, 11].map((k) => `<rect y="${(16 / 13) * k}" width="24" height="${16 / 13}" fill="#fff"/>`).join('')
  + '<rect width="10.4" height="8.62" fill="#3c3b6e"/>';
const UNION = '<rect width="24" height="16" fill="#012169"/><path d="M0 0l24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.1"/><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.2"/><path d="M12 0v16M0 8h24" stroke="#c8102e" stroke-width="3"/>';
export const FLAGS = {
  US,
  GB: UNION,
  CA: `${V('#d52b1e', '#fff', '#fff', '#d52b1e')}<path d="M12 4.2l1.3 2.4 1.6-.6-.6 3 1.4.3-1.9 1.5.3 1.2H12.6V14h-1.2v-2h-1.5l.3-1.2-1.9-1.5 1.4-.3-.6-3 1.6.6z" fill="#d52b1e"/>`,
  BR: '<rect width="24" height="16" fill="#009c3b"/><path d="M12 2.2L21.6 8 12 13.8 2.4 8z" fill="#ffdf00"/><circle cx="12" cy="8" r="3.4" fill="#002776"/>',
  MX: `${V('#006847', '#fff', '#ce1126')}<circle cx="12" cy="8" r="1.6" fill="#8c5a2b"/>`,
  AR: `${H('#74acdf', '#fff', '#74acdf')}<circle cx="12" cy="8" r="1.5" fill="#f6b40e"/>`,
  DE: H('#000', '#dd0000', '#ffce00'),
  FR: V('#002395', '#fff', '#ed2939'),
  IT: V('#009246', '#fff', '#ce2b37'),
  ES: `${H('#aa151b', '#f1bf00', '#f1bf00', '#aa151b')}`,
  PT: '<rect width="9.6" height="16" fill="#006600"/><rect x="9.6" width="14.4" height="16" fill="#ff0000"/><circle cx="9.6" cy="8" r="2.6" fill="#ffcc00"/>',
  NL: H('#ae1c28', '#fff', '#21468b'),
  BE: V('#000', '#fdda24', '#ef3340'),
  IE: V('#169b62', '#fff', '#ff883e'),
  PL: H('#fff', '#dc143c'),
  SE: '<rect width="24" height="16" fill="#006aa7"/><path d="M0 8h24M9 0v16" stroke="#fecc00" stroke-width="2.6"/>',
  CH: '<rect width="24" height="16" fill="#d52b1e"/><path d="M12 4.4v7.2M8.4 8h7.2" stroke="#fff" stroke-width="2.4"/>',
  IN: `${H('#ff9933', '#fff', '#138808')}<circle cx="12" cy="8" r="1.9" fill="none" stroke="#000080" stroke-width=".6"/>`,
  JP: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.2" fill="#bc002d"/>',
  KR: '<rect width="24" height="16" fill="#fff"/><path d="M8.4 8a3.6 3.6 0 0 1 7.2 0z" fill="#cd2e3a"/><path d="M8.4 8a3.6 3.6 0 0 0 7.2 0z" fill="#0047a0"/>',
  NG: V('#008751', '#fff', '#008751'),
  UA: H('#0057b7', '#ffd700'),
};

// format: # is a digit; several formats are tried by length. trunk: the
// national prefix people type before the number (dropped in E.164).
export const COUNTRIES = [
  { iso: 'US', name: 'United States', dial: '1', format: '(###) ###-####', trunk: '1', example: '5550100123' },
  { iso: 'CA', name: 'Canada', dial: '1', format: '(###) ###-####', trunk: '1', example: '5550100123' },
  { iso: 'BR', name: 'Brazil', dial: '55', format: ['(##) ####-####', '(##) #####-####'], trunk: '0', example: '11987650474' },
  { iso: 'MX', name: 'Mexico', dial: '52', format: '## #### ####' },
  { iso: 'AR', name: 'Argentina', dial: '54', format: '## ####-####', trunk: '0' },
  { iso: 'GB', name: 'United Kingdom', dial: '44', format: '#### ######', trunk: '0', example: '7400123456' },
  { iso: 'IE', name: 'Ireland', dial: '353', format: '## ### ####', trunk: '0' },
  { iso: 'DE', name: 'Germany', dial: '49', format: ['### #######', '### ########'], trunk: '0', example: '15123456789' },
  { iso: 'FR', name: 'France', dial: '33', format: '# ## ## ## ##', trunk: '0', example: '612345678' },
  { iso: 'ES', name: 'Spain', dial: '34', format: '### ## ## ##' },
  { iso: 'PT', name: 'Portugal', dial: '351', format: '### ### ###' },
  { iso: 'IT', name: 'Italy', dial: '39', format: '### ### ####' },
  { iso: 'NL', name: 'Netherlands', dial: '31', format: '# ########', trunk: '0' },
  { iso: 'BE', name: 'Belgium', dial: '32', format: '### ## ## ##', trunk: '0' },
  { iso: 'CH', name: 'Switzerland', dial: '41', format: '## ### ## ##', trunk: '0' },
  { iso: 'SE', name: 'Sweden', dial: '46', format: '##-### ## ##', trunk: '0' },
  { iso: 'PL', name: 'Poland', dial: '48', format: '### ### ###' },
  { iso: 'UA', name: 'Ukraine', dial: '380', format: '## ### ## ##', trunk: '0' },
  { iso: 'IN', name: 'India', dial: '91', format: '##### #####', trunk: '0', example: '9876543210' },
  { iso: 'JP', name: 'Japan', dial: '81', format: '##-####-####', trunk: '0', example: '9012345678' },
  { iso: 'KR', name: 'South Korea', dial: '82', format: '##-####-####', trunk: '0' },
  { iso: 'AU', name: 'Australia', dial: '61', format: '### ### ###', trunk: '0' },
  { iso: 'NZ', name: 'New Zealand', dial: '64', format: '## ### ####', trunk: '0' },
  { iso: 'NG', name: 'Nigeria', dial: '234', format: '### ### ####', trunk: '0' },
  { iso: 'ZA', name: 'South Africa', dial: '27', format: '## ### ####', trunk: '0' },
];

const byIso = new Map(COUNTRIES.map((c) => [c.iso, c]));
export const country = (iso) => byIso.get(String(iso || '').toUpperCase()) || COUNTRIES[0];
const formats = (c) => (Array.isArray(c.format) ? c.format : [c.format]);
const slots = (f) => (f.match(/#/g) || []).length;
/** Longest national number a country accepts. */
export const maxDigits = (c) => Math.max(...formats(c).map(slots));

/** National digits: no formatting, no trunk prefix, at most maxDigits. */
export function nationalDigits(text, c) {
  let d = String(text).replace(/\D/g, '');
  if (c.trunk && d.startsWith(c.trunk)) d = d.slice(c.trunk.length);
  return d.slice(0, maxDigits(c));
}

/** Formats national digits for a country, as far as they go: "5550100" -> "(555) 010-0". */
export function formatPhone(text, iso) {
  const c = typeof iso === 'object' ? iso : country(iso);
  const d = nationalDigits(text, c);
  if (!d) return '';
  const list = formats(c);
  const f = list.find((x) => slots(x) >= d.length && (list.length === 1 || slots(x) === d.length)) || list[list.length - 1];
  let out = '';
  let k = 0;
  for (const ch of f) {
    if (k >= d.length) break;
    if (ch === '#') out += d[k++];
    else out += ch;
  }
  return out;
}

/** True when the digits fill one of the country's formats. */
export const isComplete = (text, iso) => {
  const c = country(iso);
  const n = nationalDigits(text, c).length;
  return formats(c).some((f) => slots(f) === n);
};

/** "+5511987650474" from a country and the typed number. */
export function toE164(text, iso) {
  const c = country(iso);
  const d = nationalDigits(text, c);
  return d ? `+${c.dial}${d}` : '';
}

/** Country and national number from "+44 7400 123456" (longest dial code wins; ties keep preferred). */
export function parseInternational(text, preferred) {
  const d = String(text).replace(/\D/g, '');
  const matches = COUNTRIES.filter((c) => d.startsWith(c.dial)).sort((a, b) => b.dial.length - a.dial.length);
  if (!matches.length) return null;
  const best = matches.filter((c) => c.dial === matches[0].dial);
  const c = best.find((x) => x.iso === preferred) || best[0];
  return { iso: c.iso, national: d.slice(c.dial.length) };
}

/** Countries matching a search by name, ISO code or dial code ("+44", "44", "uni"). */
export function searchCountries(query, list = COUNTRIES) {
  const q = String(query).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!q) return list;
  const digits = q.replace(/^\+/, '');
  return list
    .map((c) => {
      const name = c.name.toLowerCase();
      let rank = -1;
      if (/^\d+$/.test(digits) && c.dial.startsWith(digits)) rank = c.dial === digits ? 0 : 1;
      else if (c.iso.toLowerCase() === q) rank = 0;
      else if (name.startsWith(q)) rank = 1;
      else if (name.split(/\s+/).some((w) => w.startsWith(q))) rank = 2;
      else if (name.includes(q)) rank = 3;
      return { c, rank };
    })
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.c);
}

/** Flag markup for a country: an SVG, or the two letter code. */
export function flagHtml(iso) {
  const art = FLAGS[iso];
  return art
    ? `<svg class="phone-input-flag" viewBox="0 0 24 16" aria-hidden="true" preserveAspectRatio="none">${art}</svg>`
    : `<span class="phone-input-flag phone-input-code" aria-hidden="true">${iso}</span>`;
}

/** Caret position after the same number of digits in formatted text. */
export function caretAfterDigits(formatted, count) {
  if (count <= 0) {
    const first = formatted.search(/\d/);
    return first < 0 ? formatted.length : first;
  }
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === count) return i + 1;
  }
  return formatted.length;
}

export function phoneInput(root, opts = {}) {
  const select = root.querySelector('select');
  const input = root.querySelector('input[type=tel]') || root.querySelector('input');
  if (!input) return { destroy() {} };
  const allowed = String(opts.countries || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  const list = allowed.length ? allowed.map((iso) => byIso.get(iso)).filter(Boolean) : COUNTRIES;
  let current = country(select ? select.value : opts.country || list[0].iso);
  const id = uid('phone');
  const created = [];

  const button = h('button', { type: 'button', class: 'phone-input-country', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': `${id}-menu` });
  const search = h('input', { type: 'search', class: 'phone-input-search', placeholder: 'Search country or code', 'aria-label': 'Search countries', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': `${id}-list`, 'aria-autocomplete': 'list' });
  const listbox = h('ul', { class: 'phone-input-list', role: 'listbox', id: `${id}-list`, 'aria-label': 'Countries' });
  const empty = h('p', { class: 'phone-input-empty', hidden: true }, 'No country found');
  const menu = h('div', { class: 'phone-input-menu', id: `${id}-menu`, hidden: true }, search, listbox, empty);
  input.before(button);
  root.append(menu);
  created.push(button, menu);
  let hidden = null;
  if (opts.name) {
    hidden = h('input', { type: 'hidden', name: opts.name });
    root.append(hidden);
    created.push(hidden);
  }
  if (select) {
    select.hidden = true;
    select.setAttribute('aria-hidden', 'true');
    select.tabIndex = -1;
  }
  root.setAttribute('data-phone-ready', '');

  const paintButton = () => {
    button.innerHTML = `${flagHtml(current.iso)}<span class="phone-input-dial">+${current.dial}</span>`;
    button.setAttribute('aria-label', `Country: ${current.name} (+${current.dial})`);
    if (!input.dataset.placeholder) input.placeholder = formatPhone(current.example || '5550100123456'.slice(0, maxDigits(current)), current);
  };
  let shown = list;
  let active = 0;
  const optionId = (c) => `${id}-${c.iso}`;
  const paintList = () => {
    listbox.innerHTML = shown.map((c, i) => `<li class="phone-input-option" role="option" id="${optionId(c)}" data-iso="${c.iso}" aria-selected="${c.iso === current.iso}"${i === active ? ' data-active' : ''}>${flagHtml(c.iso)}<span class="phone-input-name">${c.name}</span><span class="phone-input-dial">+${c.dial}</span></li>`).join('');
    empty.hidden = shown.length > 0;
    const act = shown[active];
    if (act) search.setAttribute('aria-activedescendant', optionId(act));
    else search.removeAttribute('aria-activedescendant');
    const el = act && listbox.querySelector(`#${optionId(act)}`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  };
  const state = () => {
    const e164 = toE164(input.value, current.iso);
    return { country: current.iso, dial: current.dial, national: nationalDigits(input.value, current), e164, valid: isComplete(input.value, current.iso) };
  };
  const commit = (quiet) => {
    const s = state();
    if (hidden) hidden.value = s.e164;
    root.toggleAttribute('data-valid', s.valid);
    if (!quiet) emit(root, 'auth-phone', s);
  };
  const reformat = () => {
    const raw = input.value;
    const pos = input.selectionStart ?? raw.length;
    const lead = current.trunk && raw.replace(/\D/g, '').startsWith(current.trunk) ? current.trunk.length : 0;
    const before = Math.max(0, raw.slice(0, pos).replace(/\D/g, '').length - lead);
    const next = formatPhone(raw, current);
    if (next !== raw) {
      input.value = next;
      const at = caretAfterDigits(next, before);
      if (document.activeElement === input) input.setSelectionRange(at, at);
    }
  };
  const choose = (c, focusInput = true) => {
    current = c;
    if (select && select.value !== c.iso) {
      select.value = c.iso;
      notify(select);
    }
    paintButton();
    reformat();
    commit();
    close();
    if (focusInput) input.focus();
  };
  const open = () => {
    if (!menu.hidden) return;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    search.value = '';
    shown = list;
    active = Math.max(0, shown.indexOf(current));
    paintList();
    search.focus();
  };
  function close(focusButton = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (focusButton) button.focus();
  }

  const off = new AbortController();
  const on = (el, type, fn) => el.addEventListener(type, fn, { signal: off.signal });
  on(button, 'click', () => (menu.hidden ? open() : close(true)));
  on(button, 'keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    }
  });
  on(search, 'input', () => {
    shown = searchCountries(search.value, list);
    active = 0;
    paintList();
  });
  on(search, 'keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!shown.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length;
      paintList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') close();
  });
  on(listbox, 'mousedown', (e) => e.preventDefault());
  on(listbox, 'click', (e) => {
    const li = e.target.closest('[data-iso]');
    if (li) choose(byIso.get(li.dataset.iso));
  });
  on(document, 'pointerdown', (e) => { if (!root.contains(e.target)) close(); });
  on(input, 'keydown', (e) => {
    // Backspace right after a literal ") " or "-" removes the digit before it.
    if (e.key !== 'Backspace' || input.selectionStart !== input.selectionEnd) return;
    const pos = input.selectionStart;
    if (pos > 0 && !/\d/.test(input.value[pos - 1])) {
      let k = pos - 1;
      while (k > 0 && !/\d/.test(input.value[k - 1])) k--;
      if (k > 0) {
        e.preventDefault();
        const digitsBefore = input.value.slice(0, k - 1).replace(/\D/g, '').length;
        input.value = input.value.slice(0, k - 1) + input.value.slice(k);
        input.value = formatPhone(input.value, current);
        const at = caretAfterDigits(input.value, digitsBefore);
        input.setSelectionRange(at, at);
        commit();
      }
    }
  });
  on(input, 'input', () => {
    const v = input.value.trim();
    if (v.startsWith('+') || v.startsWith('00')) {
      // An international number: switch country once the dial code is known.
      const parsed = parseInternational(v.replace(/^00/, ''), current.iso);
      if (!parsed || (allowed.length && !allowed.includes(parsed.iso))) {
        commit();
        return;
      }
      current = byIso.get(parsed.iso);
      if (select && select.value !== current.iso) {
        select.value = current.iso;
        notify(select);
      }
      paintButton();
      input.value = parsed.national;
    }
    reformat();
    commit();
  });
  if (select) on(select, 'change', () => { if (select.value !== current.iso) choose(country(select.value), false); });

  if (input.placeholder) input.dataset.placeholder = input.placeholder;
  paintButton();
  if (input.value) input.value = formatPhone(input.value, current);
  commit(true);

  const api = {
    get country() { return current.iso; },
    set country(iso) { choose(country(iso), false); },
    get value() { return state(); },
    open,
    close: () => close(),
    destroy() {
      off.abort();
      created.forEach((el) => el.remove());
      if (select) {
        select.hidden = false;
        select.removeAttribute('aria-hidden');
        select.removeAttribute('tabindex');
      }
      root.removeAttribute('data-phone-ready');
      if (root.monsoon) delete root.monsoon.authPhone;
    },
  };
  return expose(root, 'authPhone', api);
}

define('auth-phone', (root, opts) => phoneInput(root, opts).destroy);
