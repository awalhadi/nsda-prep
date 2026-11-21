#!/usr/bin/env node
/**
 * WCAG 2.x contrast checker for design tokens. No dependencies.
 *
 *   node contrast.mjs tokens.json                 check every declared pair, light and dark
 *   node contrast.mjs --pair "#F59E0B" "#FFFFFF"  check one pair (prints ratio and verdicts)
 *
 * tokens.json shape (see assets/tokens.template.json):
 *   { "color": { "<name>": { "light": "#RRGGBB", "dark": "#RRGGBB" } | "#RRGGBB" },
 *     "pairs": [ { "fg": "<name>", "bg": ["<name>", ...], "kind": "text" | "ui" | "large-text" | "decorative" } ] }
 *
 * Minimums: text 4.5:1, large-text 3:1, ui (icons, focus rings, essential edges) 3:1.
 * Decorative pairs are listed but not enforced. Exits 1 on any failure.
 */
import { readFileSync } from 'node:fs';

export const MIN = { text: 4.5, 'large-text': 3, ui: 3 };

function parseHex(hex) {
  let m = /^#([0-9a-f]{3})$/i.exec(hex);
  if (m) hex = '#' + m[1].split('').map((c) => c + c).join('');
  m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a #RGB or #RRGGBB colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
export function luminance(hex) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function value(token, theme) {
  if (token == null) return undefined;
  return typeof token === 'string' ? token : token[theme];
}

export function checkTokens(tokens) {
  const rows = [];
  const failures = [];
  if (!Array.isArray(tokens.pairs)) throw new Error('tokens file has no "pairs" array');
  const themes = new Set();
  for (const t of Object.values(tokens.color ?? {})) {
    if (typeof t === 'string') themes.add('light');
    else Object.keys(t).forEach((k) => themes.add(k));
  }
  for (const p of tokens.pairs) {
    const kind = p.kind ?? 'text';
    const bgs = Array.isArray(p.bg) ? p.bg : [p.bg];
    for (const theme of themes) {
      for (const bg of bgs) {
        const fg = value(tokens.color[p.fg], theme);
        const b = value(tokens.color[bg], theme);
        if (!fg || !b) {
          failures.push(`${theme}: ${p.fg} on ${bg}: unknown token or missing ${theme} value`);
          continue;
        }
        const ratio = contrast(fg, b);
        const min = MIN[kind];
        const ok = min === undefined || ratio >= min;
        rows.push({ theme, fg: p.fg, bg, ratio, kind, ok });
        if (!ok) failures.push(`${theme}: ${p.fg} (${fg}) on ${bg} (${b}) is ${ratio.toFixed(2)}:1, needs ${min}:1 for ${kind}`);
      }
    }
  }
  return { rows, failures };
}

function main(argv) {
  if (argv[0] === '--pair' && argv.length === 3) {
    const r = contrast(argv[1], argv[2]);
    console.log(`${argv[1]} on ${argv[2]}: ${r.toFixed(2)}:1`);
    for (const [kind, min] of Object.entries(MIN)) console.log(`  ${kind.padEnd(10)} (${min}:1) ${r >= min ? 'pass' : 'FAIL'}`);
    return r >= MIN.text ? 0 : 1;
  }
  if (argv.length !== 1) {
    console.error('usage: contrast.mjs <tokens.json> | --pair <fg> <bg>');
    return 2;
  }
  const tokens = JSON.parse(readFileSync(argv[0], 'utf8'));
  const { rows, failures } = checkTokens(tokens);
  for (const r of rows) {
    const mark = r.kind === 'decorative' ? 'deco' : r.ok ? 'pass' : 'FAIL';
    console.log(`${mark}  ${r.theme.padEnd(5)}  ${r.fg} on ${r.bg}  ${r.ratio.toFixed(2)}:1  (${r.kind})`);
  }
  if (failures.length) {
    console.error(`\n${failures.length} failing pair(s):\n` + failures.map((f) => '  ' + f).join('\n'));
    return 1;
  }
  console.log(`\nAll ${rows.filter((r) => r.kind !== 'decorative').length} enforced pairs pass.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main(process.argv.slice(2)));
