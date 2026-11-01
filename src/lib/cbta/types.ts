// Shapes of the generated bundles in src/data/cbta/generated (written by content:build).

export type CardStatus = "draft" | "reviewed" | "approved" | "changed";
export type QType = "mcq" | "matching" | "short";

export interface GenCite {
  src: string;
  page: number;
  printedPage: number | null;
  quote: string;
  cblm?: number;
  sourceTitle?: string;
  passageId?: string;
  match: "exact" | number | null;
}

export interface GenClaim {
  text: string;
  fidelity: "verbatim" | "paraphrase";
  cites: GenCite[];
}

export interface GenRealQuestion {
  id: string;
  kind: "selfcheck" | "paper";
  label: string;
  type: QType;
  question: string;
  options?: string[];
  answerIndex?: number | null;
  answerLetter?: string | null;
  answer?: string | null;
  right?: { letter: string; text: string }[];
  flags: string[];
}

export interface GenErratum {
  id: string;
  issue: string;
  proposed: string;
  source: { src: string; page: number; quote?: string };
}

export interface GenConcept {
  id: string;
  title: string;
  aliases: string[];
  cblmPrimary: number;
  sourceType: "cblm" | "question-paper-only";
  status: CardStatus;
  stars: 1 | 2 | 3;
  score: number;
  breakdown: { highlight: number; repeat: number; exam: number };
  importance: { en: string; bn: string };
  likelyTypes: QType[];
  vivaDerived: boolean;
  highlighted: boolean;
  appearsIn: { cblm: number; src: string; pages: { pdf: number; printed: number | null }[] }[];
  oneLineAnswer: GenClaim;
  keywords: { en: string; bn: string }[];
  banglaExplanation: string[];
  example: { en: string; bn?: string };
  mnemonic: { text: string; explain_bn?: string } | null;
  listAnswer: { items: GenClaim[]; declaredCount: number | null } | null;
  traps: GenClaim[];
  practice: {
    short: { prompt: string; modelAnswer: string; keyPoints: GenClaim[]; marks?: number };
    mcq: { prompt: string; options: string[]; answerIndex: number; answerCite: GenCite };
    matching: { prompt: string; pairs: { left: string; right: string; cite: GenCite }[] };
    viva: { prompt: string; answer: GenClaim };
  };
  realQuestions: GenRealQuestion[];
  errata: GenErratum[];
  openChecks: number;
  warnings: number;
}

export interface GenIndexEntry {
  id: string;
  title: string;
  aliases: string[];
  cblmPrimary: number;
  cblms: number[];
  stars: 1 | 2 | 3;
  score: number;
  status: CardStatus;
  highlighted: boolean;
  sourceType: "cblm" | "question-paper-only";
  keywords: { en: string; bn: string }[];
  oneLine: string;
  /** Real exam/self-check questions mapped to this concept. */
  asked: number;
  types: QType[];
}

export interface GenCblm {
  n: number;
  id: string;
  title: string;
  hasPdf: boolean;
  conceptIds: string[];
  highlights: number;
  covered: number;
}
