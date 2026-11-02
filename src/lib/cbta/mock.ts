// Builds a mock paper in the real CBT&A L4 pattern: 10 MCQ + 5 matching + 10 short, 60 minutes.
// Pure and seeded, so the same seed always gives the same paper (testable, shareable).

export interface PoolMeta { conceptId: string; title: string; cblm: number; stars: 1 | 2 | 3 }
export interface PoolMcq extends PoolMeta { id: string; prompt: string; options: string[]; answerIndex: number; real: string | null }
export interface PoolShort extends PoolMeta { id: string; prompt: string; modelAnswer: string; keyPoints: string[]; real: string | null }
export interface PoolPair extends PoolMeta { id: string; left: string; right: string }
export interface Pool { mcq: PoolMcq[]; short: PoolShort[]; pairs: PoolPair[] }

export interface MockPaper {
  seed: number;
  scope: number | "all";
  mcq: PoolMcq[];
  matching: { pairs: PoolPair[]; rightOrder: number[] };
  short: PoolShort[];
  minutes: number;
}

export const BLUEPRINT = { mcq: 10, matching: 5, short: 10, minutes: 60 };

/** mulberry32: small seeded PRNG. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Weighted sample without replacement, at most one item per concept. Real exam questions and ★★★ topics come first more often. */
function pick<T extends PoolMeta & { real?: string | null }>(items: T[], n: number, rand: () => number, used = new Set<string>()): T[] {
  const left = items.filter((x) => !used.has(x.conceptId));
  const out: T[] = [];
  while (out.length < n && left.length) {
    const weights = left.map((x) => x.stars * (x.real ? 1.5 : 1));
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rand() * total, i = 0;
    while (r > weights[i] && i < weights.length - 1) { r -= weights[i]; i++; }
    const [chosen] = left.splice(i, 1);
    out.push(chosen);
    used.add(chosen.conceptId);
    for (let k = left.length - 1; k >= 0; k--) if (left[k].conceptId === chosen.conceptId) left.splice(k, 1);
  }
  return out;
}

export function buildMock(pool: Pool, scope: number | "all", seed: number): MockPaper {
  const rand = rng(seed);
  const inScope = <T extends PoolMeta>(xs: T[]) => (scope === "all" ? xs : xs.filter((x) => x.cblm === scope));
  const mcq = pick(inScope(pool.mcq), BLUEPRINT.mcq, rand);
  const pairs = pick(inScope(pool.pairs), BLUEPRINT.matching, rand);
  // Matching right-hand texts must be distinct, or two answers would be identical.
  const seenRight = new Set<string>();
  const cleanPairs = pairs.filter((p) => !seenRight.has(p.right.toLowerCase()) && seenRight.add(p.right.toLowerCase()));
  const short = pick(inScope(pool.short), BLUEPRINT.short, rand);
  const rightOrder = cleanPairs.map((_, i) => i);
  for (let i = rightOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [rightOrder[i], rightOrder[j]] = [rightOrder[j], rightOrder[i]];
  }
  return { seed, scope, mcq, matching: { pairs: cleanPairs, rightOrder }, short, minutes: BLUEPRINT.minutes };
}

export interface MockAnswers {
  mcq: Record<string, number>;
  /** left index → chosen right index */
  matching: Record<number, number>;
  /** short id → share of key points the learner says they wrote (0–1) */
  short: Record<string, number>;
}

export function scoreMock(paper: MockPaper, a: MockAnswers) {
  const weak = new Set<string>();
  const strong = new Set<string>();
  let mcq = 0, matching = 0, short = 0;
  for (const q of paper.mcq) {
    if (a.mcq[q.id] === q.answerIndex) { mcq++; strong.add(q.conceptId); } else weak.add(q.conceptId);
  }
  paper.matching.pairs.forEach((p, i) => {
    if (a.matching[i] === i) { matching++; strong.add(p.conceptId); } else weak.add(p.conceptId);
  });
  for (const q of paper.short) {
    const s = a.short[q.id] ?? 0;
    if (s >= 0.6) { short++; strong.add(q.conceptId); } else weak.add(q.conceptId);
  }
  for (const id of weak) strong.delete(id);
  return {
    score: { mcq: [mcq, paper.mcq.length], matching: [matching, paper.matching.pairs.length], short: [short, paper.short.length] } as
      Record<"mcq" | "matching" | "short", [number, number]>,
    weak: [...weak],
    strong: [...strong],
  };
}
