// Priority and stars, computed only from evidence (never authored).
//
//   priority = highlight_weight + repeat_count_across_CBLMs + exam_pattern_frequency
//     highlight_weight          = 2 if highlighted, +1 if highlighted in ≥2 places
//     repeat_count_across_CBLMs = distinct CBLMs that mention the concept
//     exam_pattern_frequency    = 3 × official papers + 2 × formative/unit papers + 2 × self checks
//
//   stars: ★★★ top 25% by score (ties included) or any concept asked in an official paper;
//          ★★ next 40%; ★ the rest. Highlighted concepts get at least ★★.
//          Assessor flags may raise a concept by one star, never lower it.

export interface PrioritySignals {
  highlighted: boolean;
  highlightPlaces: number;
  cblmCount: number;
  officialPapers: number;
  otherPapers: number;
  selfChecks: number;
  assessorRaise?: boolean;
}

export interface PriorityResult {
  score: number;
  breakdown: { highlight: number; repeat: number; exam: number };
}

export function priorityScore(s: PrioritySignals): PriorityResult {
  const highlight = s.highlighted ? 2 + (s.highlightPlaces >= 2 ? 1 : 0) : 0;
  const repeat = s.cblmCount;
  const exam = 3 * s.officialPapers + 2 * s.otherPapers + 2 * s.selfChecks;
  return { score: highlight + repeat + exam, breakdown: { highlight, repeat, exam } };
}

export type Stars = 1 | 2 | 3;

export function assignStars(items: { id: string; score: number; signals: PrioritySignals }[]): Map<string, Stars> {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const n = sorted.length;
  const out = new Map<string, Stars>();
  if (!n) return out;
  const cut3 = sorted[Math.max(0, Math.ceil(n * 0.25) - 1)].score;
  const cut2 = sorted[Math.max(0, Math.ceil(n * 0.65) - 1)].score;
  for (const it of sorted) {
    let stars: Stars = it.score >= cut3 ? 3 : it.score >= cut2 ? 2 : 1;
    if (it.signals.officialPapers > 0) stars = 3;
    if (it.signals.highlighted && stars < 2) stars = 2;
    if (it.signals.assessorRaise && stars < 3) stars = (stars + 1) as Stars;
    out.set(it.id, stars);
  }
  return out;
}
