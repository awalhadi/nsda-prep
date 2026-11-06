import type { CbtaState } from "./progress";
import { localDay, addDays } from "./leitner";

type Concept = { id: string; score: number; cblms: number[] };
export function studySummary(state: CbtaState, concepts: Concept[], now = new Date()) {
  const ids = new Set(concepts.map((c) => c.id));
  const attempts = state.attempts.filter((a) => ids.has(a.conceptId) && a.kind !== "revise" && Number.isFinite(Date.parse(a.at)));
  const read = concepts.filter((c) => state.read[c.id]).length;
  const mastered = concepts.filter((c) => state.mastered[c.id]).length;
  const practiced = new Set(attempts.map((a) => a.conceptId)).size;
  const correct = attempts.filter((a) => a.correct).length;
  const today = localDay(now);
  const due = Object.entries(state.leitner).filter(([id, e]) => ids.has(id) && e.due <= today).sort((a, b) => a[1].due.localeCompare(b[1].due)).map(([id]) => id);
  const latest = new Map(attempts.map((a) => [a.conceptId, a]));
  const recent = [...attempts].reverse().find((a) => !a.correct && latest.get(a.conceptId) === a && !state.mastered[a.conceptId]);
  const next = due[0] ?? recent?.conceptId ?? [...concepts].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).find((c) => !state.read[c.id])?.id ?? concepts[0]?.id;
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const count = attempts.filter((a) => localDay(new Date(a.at)) === date).length;
    return { date, count };
  });
  return { read, mastered, practiced, due, next, days, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : null, todayCount: days[6].count, total: concepts.length };
}
