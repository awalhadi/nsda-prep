#!/usr/bin/env node
/**
 * ui-lint: static scan of web UI files for anti-patterns that a pattern can find. No dependencies.
 *
 *   node ui-lint.mjs [paths…]          scan files or folders (default: current folder)
 *   node ui-lint.mjs src --no-hex      skip the raw-colour rule (for projects without tokens yet)
 *   node ui-lint.mjs src --json        machine-readable output
 *
 * Scans .html .css .scss .less .js .jsx .ts .tsx .vue .svelte .astro .php (Blade),
 * skipping node_modules, .git, dist, build, .next, .nuxt, .svelte-kit, coverage, vendor.
 * Output: findings grouped by file as `file:line - message [rule-id]` (the format of
 * references/18-web-interface-rules.md). Exits 1 when anything is found, 0 when clean.
 *
 * It finds candidates, not verdicts: read each finding in context. It cannot judge design,
 * copy, contrast (use contrast.mjs) or behaviour in a browser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.php']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.output', '.svelte-kit', 'coverage', 'vendor', '.turbo', 'out']);
const STYLE_EXT = new Set(['.css', '.scss', '.less']);
const COMPONENT_EXT = new Set(['.jsx', '.tsx', '.vue', '.svelte', '.astro']);

const args = process.argv.slice(2);
const opts = { hex: !args.includes('--no-hex'), json: args.includes('--json') };
const roots = args.filter((a) => !a.startsWith('--'));
if (roots.length === 0) roots.push('.');

function walk(p, out) {
  let st;
  try { st = statSync(p); } catch { console.error(`ui-lint: cannot read ${p}`); process.exitCode = 2; return out; }
  if (st.isDirectory()) {
    if (SKIP_DIRS.has(basename(p))) return out;
    for (const name of readdirSync(p)) walk(join(p, name), out);
  } else if (EXT.has(extname(p).toLowerCase()) && !/\.min\.(js|css)$/.test(p) && st.size < 2_000_000) {
    out.push(p);
  }
  return out;
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** Each rule returns [{ index, msg }] for one file. */
const rules = [
  {
    id: 'no-transition-all',
    test: (t) => matches(t, /transition(-property)?\s*:\s*all\b|\btransition-all\b|transition:\s*['"]all\b/g,
      'transition: all; list the properties (transform, opacity)'),
  },
  {
    id: 'focus-visible',
    test: (t) => /focus-visible|focus:ring|focus-within:ring|:focus\s*\{[^}]*(box-shadow|outline\s*:\s*(?!none|0)\S)/.test(t) ? [] :
      matches(t, /outline\s*:\s*(none|0)\b|\boutline-none\b/g, 'outline removed with no focus-visible replacement in this file'),
  },
  {
    id: 'never-disable-zoom',
    test: (t) => matches(t, /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/g, 'zoom disabled in viewport meta'),
  },
  {
    id: 'allow-paste',
    test: (t) => matches(t, /on(Paste|paste)\s*=?\s*[{"'][^\n]{0,120}preventDefault|@paste\.prevent|on:paste\|preventDefault|addEventListener\(\s*['"]paste['"][^\n]{0,160}preventDefault/g,
      'paste blocked; never block paste'),
  },
  {
    id: 'image-dimensions',
    test: (t) => {
      const out = [];
      for (const m of t.matchAll(/<(img|Image|NuxtImg|enhanced:img)\b[^>]*?>/gs)) {
        const tag = m[0];
        const sized = (/\bwidth\s*=/.test(tag) && /\bheight\s*=/.test(tag)) || /\bfill\b|aspect-|aspectRatio|aspect-ratio/.test(tag);
        if (!sized) out.push({ index: m.index, msg: `<${m[1]}> without width and height (layout shift)` });
        if (m[1] === 'img' && !/\balt\s*=/.test(tag)) out.push({ index: m.index, msg: '<img> without alt (use alt="" if decorative)' });
      }
      return out;
    },
  },
  {
    id: 'semantic-controls',
    test: (t) => {
      const out = [];
      for (const m of t.matchAll(/<(div|span|li|td|section)\b[^>]*?(onClick|@click|v-on:click|on:click)\b[^>]*?>/gs)) {
        if (!/\brole\s*=\s*["']?(button|link|tab|menuitem|option|checkbox|switch)/.test(m[0])) {
          out.push({ index: m.index, msg: `<${m[1]}> with a click handler; use <button> or <a>` });
        }
      }
      return out;
    },
  },
  {
    id: 'icon-control-name',
    test: (t) => {
      const out = [];
      for (const m of t.matchAll(/<(button|Button|a)\b([^>]*)>\s*(<svg\b|<[A-Z]\w*(Icon)?\b[^>]*\/>\s*<\/(button|Button|a)>)/gs)) {
        const attrs = m[2];
        if (!/aria-label|aria-labelledby|title\s*=|sr-only|visually-hidden/.test(attrs) &&
            !/sr-only|visually-hidden/.test(t.slice(m.index, m.index + 600).split(/<\/(button|Button|a)>/)[0])) {
          out.push({ index: m.index, msg: 'icon-only control without an accessible name (aria-label)' });
        }
      }
      return out;
    },
  },
  {
    id: 'raw-colour',
    applies: (f) => opts.hex && COMPONENT_EXT.has(extname(f)) && !/token|theme|palette|colors?\./i.test(basename(f)),
    test: (t) => matches(t, /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])|\b(?:bg|text|border|fill|stroke|ring|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g,
      'raw colour in a component; use a token'),
  },
  {
    id: 'real-ellipsis',
    applies: (f) => !STYLE_EXT.has(extname(f)),
    test: (t) => matches(t, /(?<=[>"'`][^<>"'`{}\n]{0,80}[A-Za-zÀ-ɏ])\.\.\.(?=\s*[<"'`])/g, '"..." in copy; use the ellipsis character …'),
  },
  {
    id: 'transform-opacity-only',
    test: (t) => {
      const out = matches(t, /transition(-property)?\s*:[^;{}\n]*\b(width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*)\b[^;{}\n]*/g,
        'transition on a layout property; animate transform or opacity');
      for (const m of t.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?\})\s*\}/g)) {
        if (/[{;\s](width|height|top|left|right|bottom|margin(-\w+)?)\s*:/.test(m[1])) {
          out.push({ index: m.index, msg: '@keyframes animates a layout property; use transform' });
        }
      }
      return out;
    },
  },
  {
    id: 'reduced-motion',
    test: (t, f) => {
      const guarded = /prefers-reduced-motion|motion-reduce:|motion-safe:|useReducedMotion|reducedMotion|prefersReducedMotion|ReduceMotion/.test(t);
      if (guarded) return [];
      const out = [];
      const kf = /@keyframes\s+[\w-]+|\banimate-(spin|ping|pulse|bounce)\b/.exec(t);
      if (kf) out.push({ index: kf.index, msg: 'animation with no prefers-reduced-motion handling in this file' });
      const lib = /from\s+['"](gsap|motion\/react|framer-motion|animejs|@motionone\/[\w-]+|lottie-web|@lottiefiles\/[\w-]+)['"]/.exec(t);
      if (lib) out.push({ index: lib.index, msg: `${lib[1]} used with no reduced-motion check in this file` });
      return out;
    },
  },
  {
    id: 'autofocus',
    applies: (f) => !STYLE_EXT.has(extname(f)),
    test: (t) => matches(t, /\bautoFocus\b|\bautofocus\b(?!\s*=\s*["']?false)/g, 'autofocus: justify it (desktop only, one primary input)'),
  },
  {
    id: 'tabindex-positive',
    test: (t) => matches(t, /tab[iI]ndex\s*=\s*\{?\s*["']?[1-9]/g, 'positive tabindex breaks the reading order'),
  },
  {
    id: 'placeholder-as-label',
    test: (t) => {
      const out = [];
      const hasLabels = /<label\b|aria-label|aria-labelledby|<Label\b|FormLabel/.test(t);
      if (hasLabels) return out;
      for (const m of t.matchAll(/<(input|textarea|Input|TextField)\b[^>]*\bplaceholder\s*=[^>]*>/gs)) {
        if (!/type\s*=\s*["'](hidden|submit|button|checkbox|radio)["']/.test(m[0])) {
          out.push({ index: m.index, msg: 'input with a placeholder and no label in this file' });
        }
      }
      return out;
    },
  },
];

function matches(text, re, msg) {
  const out = [];
  for (const m of text.matchAll(re)) out.push({ index: m.index, msg });
  return out;
}

const files = roots.flatMap((r) => walk(r, []));
const report = [];
for (const f of files) {
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }
  const found = [];
  for (const rule of rules) {
    if (rule.applies && !rule.applies(f)) continue;
    for (const hit of rule.test(text, f)) found.push({ line: lineOf(text, hit.index), msg: hit.msg, rule: rule.id });
  }
  if (found.length) {
    const seen = new Set();
    const unique = found.filter((x) => { const k = `${x.line}|${x.rule}`; if (seen.has(k)) return false; seen.add(k); return true; });
    unique.sort((a, b) => a.line - b.line);
    const rel = relative(process.cwd(), f);
    report.push({ file: !rel || rel.startsWith('..') ? f : rel, findings: unique });
  }
}

const total = report.reduce((n, r) => n + r.findings.length, 0);
if (opts.json) {
  console.log(JSON.stringify({ files: files.length, findings: total, report }, null, 2));
} else {
  for (const r of report) {
    console.log(`## ${r.file}\n`);
    for (const x of r.findings) console.log(`${r.file}:${x.line} - ${x.msg} [${x.rule}]`);
    console.log('');
  }
  console.log(total ? `ui-lint: ${total} finding(s) in ${report.length} of ${files.length} file(s). Read each in context.`
                    : `ui-lint: no findings in ${files.length} file(s). Pattern checks only; still review the screen.`);
}
if (total) process.exitCode = 1;
