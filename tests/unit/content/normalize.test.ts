import { describe, expect, it } from "vitest";
import { cleanText, isTrivialToken, joinWords, normalizeForMatch, tokens } from "../../../scripts/content/lib/normalize.ts";

describe("cleanText", () => {
  it("unifies quotes, dashes, bullets and spaces", () => {
    expect(cleanText("“Right” – to refuse")).toBe('"Right" - to refuse');
    expect(cleanText(" item")).toBe("• item");
    expect(cleanText("soft­hyphen")).toBe("softhyphen");
  });
});

describe("joinWords", () => {
  it("repairs line-break hyphenation", () => {
    expect(joinWords(["competency", "assess-", "ment", "plan"])).toBe("competency assessment plan");
  });
  it("keeps real hyphenated words before capitals", () => {
    expect(joinWords(["Pre-", "Voc"])).toBe("Pre- Voc");
  });
});

describe("normalizeForMatch", () => {
  it("ignores case, punctuation and bullets", () => {
    expect(normalizeForMatch("• Validity, Reliability; FLEXIBILITY!")).toBe("validity reliability flexibility");
    expect(tokens("Rules of Evidence: valid")).toEqual(["rules", "of", "evidence", "valid"]);
  });
});

describe("isTrivialToken", () => {
  it("detects bullets and stray punctuation", () => {
    expect(isTrivialToken("•")).toBe(true);
    expect(isTrivialToken("-")).toBe(true);
    expect(isTrivialToken("a")).toBe(false);
    expect(isTrivialToken("5S")).toBe(false);
  });
});
