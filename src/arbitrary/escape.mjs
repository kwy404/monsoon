// Class name escaping for selectors. Used by the build, the purge CLI and the
// runtime engine, so a class is escaped the same way everywhere.

// CSS.escape as specified in CSSOM, usable in Node.
export function escapeClass(value) {
  const str = String(value);
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (code === 0) {
      out += '�';
    } else if (
      (code >= 0x1 && code <= 0x1f) ||
      code === 0x7f ||
      (i === 0 && code >= 0x30 && code <= 0x39) ||
      (i === 1 && code >= 0x30 && code <= 0x39 && str.charCodeAt(0) === 0x2d)
    ) {
      out += `\\${code.toString(16)} `;
    } else if (i === 0 && str.length === 1 && code === 0x2d) {
      out += `\\${ch}`;
    } else if (code >= 0x80 || code === 0x2d || code === 0x5f || /[0-9A-Za-z]/.test(ch)) {
      out += ch;
    } else {
      out += `\\${ch}`;
    }
  }
  return out;
}
