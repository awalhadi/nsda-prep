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
  listAnswer: { title: string | null; titleBn: string | null; items: GenClaim[]; itemsBn: string[]; declaredCount: number | null } | null;
  traps: GenClaim[];
  visual: GenVisual | null;
  /** Extra blocks from the CBLM study guide (forms, longer tables) shown under the card. */
  extra: GenGuideBlock[];
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
  /** The topic list, in CBLM order. */
  groups: GenTopicGroup[];
  guide: { sections: number; outline: { total: number; covered: number } | null } | null;
}

export interface GenTopicRef {
  id: string;
  /** Card id, or null for a guide-only topic (/cbta/cblm/[n]/topic/[id]). */
  concept: string | null;
  title: string;
  title_bn: string | null;
}

export interface GenTopicGroup {
  label: string;
  title: string;
  title_bn: string | null;
  topics: GenTopicRef[];
}

// ---------- visual blocks + study guide ----------

export type GenCell = string | GenClaim;
type Outlined = { outline?: string[] };

export type GenTable = Outlined & { kind: "table"; title?: string; title_bn?: string; columns: string[]; rows: GenCell[][] };
export type GenSteps = Outlined & { kind: "steps"; title: string; title_bn?: string; items: GenClaim[]; labels_bn?: string[]; cycle?: boolean };
export type GenCompareSide = { title: string; title_bn?: string; points: GenClaim[] };
export type GenCompare = Outlined & { kind: "compare"; title: string; title_bn?: string; left: GenCompareSide; right: GenCompareSide };
export type GenVisual = GenTable | GenSteps | GenCompare;

export type GenGuideBlock =
  | GenVisual
  | (Outlined & { kind: "qa"; q: string; q_bn: string; answer: GenClaim; example?: { en: string; bn?: string }; tip?: string; tip_bn?: string; concept?: string })
  | (Outlined & { kind: "list"; title: string; title_bn?: string; items: GenClaim[]; items_bn?: string[]; ordered?: boolean })
  | (Outlined & { kind: "text"; title?: string; claims?: GenClaim[]; bn?: string[] })
  | (Outlined & { kind: "form"; title: string; title_bn?: string; cite: GenCite; morePages?: number[]; fields?: string[]; columns?: string[]; rows?: string[][]; footer?: string[]; note_bn?: string })
  | (Outlined & { kind: "note"; tone: "caution" | "tip"; claims?: GenClaim[]; text?: string; bn?: string });

export interface GenGuideTopic {
  id: string;
  concept?: string;
  title?: string;
  title_bn: string;
  blocks: GenGuideBlock[];
}

export interface GenGuideSection {
  id: string;
  kind: "overview" | "info" | "practical" | "review";
  label: string;
  title: string;
  title_bn: string;
  pages: [number, number];
  topics: GenGuideTopic[];
}

export interface GenGuideSelfCheck {
  question: string;
  q_bn: string;
  modelAnswer: string;
  keyPoints: GenClaim[];
  tip?: string;
  concept?: string;
  real: (GenRealQuestion & { page: number; printedPage: number | null }) | null;
}

export interface GenGuide {
  cblm: number;
  title: string;
  title_bn: string;
  intro_bn: string[];
  sections: GenGuideSection[];
  selfChecks: GenGuideSelfCheck[];
  practice: {
    mcq: { prompt: string; options: string[]; answerIndex: number; answerCite: GenCite; concept?: string }[];
    matching: { prompt: string; pairs: { left: string; right: string; cite: GenCite }[] };
    viva: { q: string; q_bn?: string; answer: GenClaim }[];
  };
  revision: { topic: string; answer: GenClaim; concept?: string }[];
  outline: { total: number; covered: number; missing: string[] } | null;
  warnings: number;
}
