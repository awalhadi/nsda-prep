import collection from "../../data/cbta/short-questions.json";

export interface ShortQuestion {
  id: number;
  sourcePage: number;
  question: string;
  sourceAnswer: string;
  conceptId: string | null;
  study?: { answer: string; bn: string; example: string };
  reviewNote?: string;
}

export const SHORT_QUESTIONS: ShortQuestion[] = collection.questions;
export const SHORT_SOURCE = collection.source;

export function questionsForConcept(id: string): ShortQuestion[] {
  return SHORT_QUESTIONS.filter((q) => q.conceptId === id);
}
