// "Why important" lines in English and Bangla, built from evidence with fixed
// templates so they can never mention a source that does not exist.

import type { Stars } from "./priority.ts";

export interface ImportanceFacts {
  /** e.g. "Final Formative 01 (MCQ 3)" */
  papers: string[];
  /** e.g. "CBLM 3 Self Check 1 (Q4)" */
  selfChecks: string[];
  highlightedIn: number[];
  types: ("mcq" | "matching" | "short")[];
  stars: Stars;
}

const TYPE_EN: Record<string, string> = { mcq: "MCQ", matching: "matching", short: "short question" };
const TYPE_BN: Record<string, string> = { mcq: "MCQ", matching: "matching", short: "short question" };

function joinEn(xs: string[]): string {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

function joinBn(xs: string[]): string {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} আর ${xs[xs.length - 1]}`;
}

export function importanceReason(f: ImportanceFacts): { en: string; bn: string } {
  const asked = [...f.papers, ...f.selfChecks];
  const en: string[] = [];
  const bn: string[] = [];
  if (asked.length) {
    en.push(`Asked in ${joinEn(asked)}.`);
    bn.push(asked.length > 1 ? `${joinBn(asked)}: ${asked.length} জায়গায় এসেছে।` : `${asked[0]}-এ এসেছে।`);
  }
  if (f.highlightedIn.length) {
    const cblms = f.highlightedIn.map((n) => `CBLM ${n}`);
    en.push(`Highlighted in ${joinEn(cblms)}.`);
    bn.push(`${joinBn(cblms)}-এ highlight করা আছে।`);
  }
  if (f.types.length) {
    en.push(`Comes as ${joinEn(f.types.map((t) => TYPE_EN[t]))}.`);
    bn.push(`পরীক্ষায় ${joinBn(f.types.map((t) => TYPE_BN[t]))} হিসেবে আসে।`);
  }
  if (!asked.length && !f.highlightedIn.length) {
    en.push("Not yet seen in a paper or highlight.");
    bn.push("এখনো কোনো প্রশ্নপত্র বা highlight-এ পাওয়া যায়নি।");
  }
  if (f.stars === 3) bn.push("অবশ্যই পড়বেন।");
  return { en: en.join(" "), bn: bn.join(" ") };
}
