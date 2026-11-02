// Leitner revision boxes for concepts the learner missed.
// Box 1 → review in 1 day, box 2 → 3 days, box 3 → 7 days; correct in box 3 = mastered.
// Dates are local calendar days ("YYYY-MM-DD"), so "due tomorrow" follows the learner's clock.

export type Box = 1 | 2 | 3;

export interface LeitnerEntry {
  box: Box;
  due: string;
  last: string;
}

export const INTERVAL_DAYS: Record<Box, number> = { 1: 1, 2: 3, 3: 7 };

export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + n));
}

/**
 * Next state after a review. `undefined` in = not in revision yet.
 * Returns `null` when the concept is mastered (leaves revision).
 */
export function review(entry: LeitnerEntry | undefined, correct: boolean, today: string): LeitnerEntry | null {
  if (!correct) return { box: 1, due: addDays(today, INTERVAL_DAYS[1]), last: today };
  if (!entry) return null; // right first time: nothing to revise
  if (entry.box === 3) return null;
  const box = (entry.box + 1) as Box;
  return { box, due: addDays(today, INTERVAL_DAYS[box]), last: today };
}

export function isDue(entry: LeitnerEntry, today: string): boolean {
  return entry.due <= today;
}
