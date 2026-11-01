// Text normalisation shared by extraction, matching and fidelity checks.

const BULLETS = /[•▪●·◦‣⁃∙]/g;
const QUOTES_SINGLE = /[‘’‚‛′]/g;
const QUOTES_DOUBLE = /[“”„‟″]/g;
const DASHES = /[‐-―−]/g;
const SOFT_HYPHEN = /­/g;
const ZERO_WIDTH = /[​-‍﻿]/g;

/** Unicode/punctuation clean-up that keeps the text human-readable. */
export function cleanText(s: string): string {
  return s
    .normalize("NFKC")
    .replace(SOFT_HYPHEN, "")
    .replace(ZERO_WIDTH, "")
    .replace(QUOTES_SINGLE, "'")
    .replace(QUOTES_DOUBLE, '"')
    .replace(DASHES, "-")
    .replace(BULLETS, "•")
    .replace(/[ \t ]+/g, " ")
    .trim();
}

/** Join word tokens, repairing line-break hyphenation ("assess- ment" → "assessment"). */
export function joinWords(words: string[]): string {
  let out = "";
  for (const w of words) {
    if (!out) out = w;
    else if (/[A-Za-z]-$/.test(out) && /^[a-z]/.test(w)) out = out.slice(0, -1) + w;
    else out += " " + w;
  }
  return cleanText(out);
}

/** Aggressive form used only for comparing text (quotes ↔ source). */
export function normalizeForMatch(s: string): string {
  return cleanText(s)
    .toLowerCase()
    .replace(/([a-z])-\s+([a-z])/g, "$1$2")
    .replace(/•/g, " ")
    .replace(/[^\p{L}\p{N}%&/+]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string): string[] {
  const n = normalizeForMatch(s);
  return n ? n.split(" ") : [];
}

/** True when a token carries no letters or digits (bullets, dashes, stray punctuation). */
export function isTrivialToken(s: string): boolean {
  return !/[\p{L}\p{N}]/u.test(s);
}
