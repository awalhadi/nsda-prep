import { describe, expect, it } from "vitest";
import { detectSection, isTocPage } from "../../../scripts/content/lib/segment.ts";
import type { RawLine } from "../../../scripts/content/lib/raw.ts";

const line = (text: string, size = 15.96, bold = true): RawLine => ({ bbox: [54, 100, 500, 116], text, size, bold });

describe("detectSection", () => {
  it.each([
    ["Information1 Practice Inclusivity", "info", 1],
    ["Information 2: Work within organization's quality", "info", 2],
    ["Self Check No. 2 Prepare a program delivery plans and", "selfcheck", 2],
    ["Self check 1 Prepare Assessment Environment and the", "selfcheck", 1],
    ["Answer Key No: 1 Determine the focus of assessment", "answerkey", 1],
    ["Answer Sheet No.3 Organise Learning and Teaching", "answerkey", 3],
    ["Apply OSH practices in a CBT&A environment - Information: 1 - Workplace Hazards", "info", 1],
  ])("%s → %s %i", (text, kind, num) => {
    const s = detectSection(line(text), 11, false);
    expect(s?.kind).toBe(kind);
    expect(s?.num).toBe(num);
  });

  it("ignores body sentences and table-of-contents rows", () => {
    expect(detectSection(line("complete the questions in the Self Check Sheets.", 11.04, false), 11, false)).toBeNull();
    expect(detectSection(line("Self Check: 1- Workplace Hazards ........................ 16"), 11, false)).toBeNull();
  });

  it("requires a number for numbered parts", () => {
    expect(detectSection(line("Job"), 11, false)).toBeNull();
  });

  it("recognises learning activities and review pages", () => {
    expect(detectSection(line("Learning Activities"), 11, false)?.kind).toBe("activity");
    expect(detectSection(line("Review of Competency"), 11, false)?.kind).toBe("review");
  });
});

describe("isTocPage", () => {
  it("detects a contents page", () => {
    expect(isTocPage([line("Table of Contents")])).toBe(true);
    expect(isTocPage([line("Information 1 Practice")])).toBe(false);
  });
});
