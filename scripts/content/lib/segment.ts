// Splits a CBLM into its standard parts (Information Sheet, Self Check,
// Answer Key, Job/Specification Sheet …) and tracks the active heading.

import type { RawDoc, RawLine, RawPage } from "./raw.ts";
import { cleanText } from "./normalize.ts";
import { bodySize, detectBoilerplate, headingLevel, isBoilerplate, orderedLines, printedPageNumber } from "./layout.ts";

export type SectionKind =
  | "front" | "lo" | "activity" | "info" | "selfcheck" | "answerkey" | "job" | "spec" | "review";

export interface Section {
  kind: SectionKind;
  num: number | null;
  title: string;
  /** Module number inside the PDF; some CBLMs (e.g. CBLM 8) bundle a second module. */
  part: number;
}

const MARKER =
  /^(?:.{0,90}?\s-\s*)?(information(?:\s+sheet)?|info\s+sheet|self[\s-]*check(?:\s+sheet)?|answer\s+key|answer\s+sheet|job\s+sheet|job|specification\s+sheet|specification|learning\s+activit(?:y|ies)(?:\s+page)?|review\s+of\s+competency|learning\s+outcomes?)(?=[\s\d:.\-–]|$)\s*(?:no\.?|number)?\s*[:.\-–]?\s*(\d{1,2})?\s*[:.\-–]?\s*(.*)$/i;

function kindOf(word: string): SectionKind {
  const w = word.toLowerCase().replace(/\s+/g, " ");
  if (w.startsWith("info")) return "info";
  if (w.startsWith("self")) return "selfcheck";
  if (w.startsWith("answer")) return "answerkey";
  if (w.startsWith("job")) return "job";
  if (w.startsWith("spec")) return "spec";
  if (w.startsWith("learning activit")) return "activity";
  if (w.startsWith("review")) return "review";
  return "lo";
}

/** Recognises a section marker line; only heading-like lines qualify. */
export function detectSection(line: RawLine, body: number, isTopLine: boolean): Section | null {
  const text = cleanText(line.text);
  if (/\.{4,}/.test(text) || text.length > 140) return null; // TOC rows / sentences
  const headingLike = line.size >= Math.max(12, body + 0.9) || (isTopLine && (line.bold || line.size < 9));
  if (!headingLike) return null;
  const m = MARKER.exec(text);
  if (!m) return null;
  const kind = kindOf(m[1]);
  const num = m[2] ? Number(m[2]) : null;
  // Numbered parts must carry a number; bare words like "Job" in a heading are not markers.
  if ((kind === "info" || kind === "selfcheck" || kind === "answerkey" || kind === "job" || kind === "spec") && num === null)
    return null;
  return { kind, num, title: cleanText(m[3] ?? "").replace(/^[:.\-–\s]+/, ""), part: 1 };
}

/** Table-of-contents pages list every section title, so they must not move the section pointer. */
export function isTocPage(lines: RawLine[]): boolean {
  if (lines.some((l) => /^\s*(table\s+of\s+)?contents\s*$/i.test(l.text))) return true;
  return lines.filter((l) => /\.{4,}/.test(l.text)).length >= 5;
}

export interface PageInfo {
  page: number;
  printedPage: number | null;
  section: Section;
  /** Content lines (boilerplate removed) in reading order. */
  lines: RawLine[];
  /** Heading active at each content line (same index as `lines`). */
  headingAt: string[];
  text: string;
  lowText: boolean;
  images: number;
}

export interface Segmented {
  body: number;
  boiler: Set<string>;
  pages: PageInfo[];
}

export function segmentDoc(doc: RawDoc): Segmented {
  const body = bodySize(doc);
  const boiler = detectBoilerplate(doc);
  let section: Section = { kind: "front", num: null, title: "", part: 1 };
  let seenInfo = false;
  let heading = "";
  const pages: PageInfo[] = [];

  for (const page of doc.pages) {
    const all = orderedLines(page);
    // Section markers may sit in running headers, so scan before removing boilerplate.
    const topLines = all.slice(0, 4);
    for (const l of isTocPage(all) ? [] : all) {
      const s = detectSection(l, body, topLines.includes(l));
      if (s && !(s.kind === section.kind && s.num === section.num)) {
        // Each module has one "Learning Activities" page; another one after content starts a new module.
        const part = s.kind === "activity" && seenInfo ? section.part + 1 : section.part;
        if (s.kind === "activity" && seenInfo) seenInfo = false;
        if (s.kind === "info") seenInfo = true;
        section = { ...s, part };
        heading = s.title || heading;
        break;
      }
    }
    const content = all.filter((l) => !isBoilerplate(l, page, boiler));
    const headingAt: string[] = [];
    let prevHeadingLine: RawLine | null = null;
    for (const l of content) {
      const marker = detectSection(l, body, false);
      if (marker) {
        heading = marker.title || heading;
        prevHeadingLine = l;
      } else if (headingLevel(l, body) > 0) {
        const p = prevHeadingLine;
        // A heading that wraps onto a second line continues the first one.
        const wraps = p !== null && Math.abs(p.size - l.size) < 0.3 &&
          l.bbox[1] - p.bbox[3] < l.size * 0.8 && l.bbox[1] > p.bbox[1];
        heading = wraps ? `${heading} ${cleanText(l.text)}` : cleanText(l.text);
        prevHeadingLine = l;
      } else {
        prevHeadingLine = null;
      }
      headingAt.push(heading);
    }
    const text = content.map((l) => cleanText(l.text)).join("\n");
    pages.push({
      page: page.page,
      printedPage: printedPageNumber(page),
      section: { ...section },
      lines: content,
      headingAt,
      text,
      lowText: text.replace(/\s/g, "").length < 80,
      images: page.images,
    });
  }
  return { body, boiler, pages };
}

/** Heading active at a vertical position on a page. */
export function headingAtY(info: PageInfo, y: number, fallback: string): string {
  let h = fallback;
  for (let i = 0; i < info.lines.length; i++) {
    if (info.lines[i].bbox[1] <= y + 1) h = info.headingAt[i];
    else break;
  }
  return h;
}

export function pageOf(seg: Segmented, page: RawPage): PageInfo {
  return seg.pages[page.page - 1];
}
