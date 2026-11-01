// Evidence packs: everything an author may use for one concept, and nothing else.
//
//   content/cbta/.cache/packs/<conceptId>.md   (gitignored)
//
// Input: content/cbta/authoring/concept-map.json → concepts[{ id, title, cblmPrimary, covers, questions }].
// Usage: node --experimental-strip-types scripts/content/packs.ts [conceptId …]

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib/raw.ts";
import { loadEvidence, pageText, printedPage } from "./lib/evidence.ts";
import { questionLabel } from "./lib/build-core.ts";
import { writeText } from "./lib/canonical-json.ts";

interface MapEntry { id: string; title: string; cblmPrimary: number; covers: string[]; questions: string[] }

const map = JSON.parse(readFileSync(join(ROOT, "content/cbta/authoring/concept-map.json"), "utf8")) as { concepts?: MapEntry[] };
const only = process.argv.slice(2);
const ev = loadEvidence();
let n = 0;

for (const c of map.concepts ?? []) {
  if (only.length && !only.includes(c.id)) continue;
  const out: string[] = [`# Evidence pack: ${c.title} (\`${c.id}\`)`, ""];
  out.push("Use only this pack. Copy every quote word-for-word from the page text below and cite its src + PDF page.", "");

  out.push("## Highlighted passages to cover", "");
  const pages = new Set<string>();
  for (const id of c.covers) {
    const p = ev.passages.get(id);
    if (!p) { out.push(`- MISSING passage ${id}`); continue; }
    pages.add(`${p.src}:${p.page}`);
    out.push(`- \`${id}\` · ${p.src} PDF p.${p.page} (printed ${p.printedPage ?? "?"}) · heading "${p.heading}"${p.flags.length ? ` · flags: ${p.flags.join(", ")}` : ""}`);
    if (p.leadIn) out.push(`  - lead-in: ${p.leadIn}`);
    out.push(`  - text: ${p.text}`);
  }
  out.push("");

  out.push("## Real questions this concept answers", "");
  for (const id of c.questions) {
    const q = ev.questions.get(id);
    if (!q) { out.push(`- MISSING question ${id}`); continue; }
    out.push(`- \`${id}\` · ${questionLabel(q)}`);
    out.push(`  - Q: ${q.item.question}`);
    if (q.kind === "selfcheck") {
      pages.add(`${q.src}:${q.item.answerPage ?? q.item.questionPage}`);
      out.push(`  - CBLM answer key (PDF p.${q.item.answerPage}): ${(q.item.answer ?? "—").replace(/\n/g, " / ")}`);
      if (q.item.flags.length) out.push(`  - flags: ${q.item.flags.join(", ")}`);
    } else {
      if (q.item.options) out.push(`  - options: ${q.item.options.map((o, i) => `${"abcd"[i]}) ${o}`).join(" | ")}`);
      if (q.item.answerIndex != null) out.push(`  - paper answer: ${"abcd"[q.item.answerIndex]}`);
      if (q.item.answerLetter) out.push(`  - paper answer letter: ${q.item.answerLetter}`);
      if (q.set) out.push(`  - column B: ${q.set.right.map((r) => `${r.letter}) ${r.text}`).join(" | ")}`);
      if (q.item.answer) out.push(`  - paper answer: ${q.item.answer.replace(/\n/g, " / ")}`);
      pages.add(`${q.src}:${q.item.page}`);
    }
  }
  out.push("");

  out.push("## Full page text", "");
  for (const key of [...pages].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    const [src, page] = key.split(":");
    out.push(`### ${src} PDF p.${page} (printed ${printedPage(ev, src, Number(page)) ?? "?"})`, "", "```", pageText(ev, src, Number(page)) ?? "", "```", "");
  }
  writeText(join(ROOT, "content/cbta/.cache/packs", `${c.id}.md`), out.join("\n"));
  n++;
}
console.log(`packs: ${n} evidence pack(s) in content/cbta/.cache/packs`);
