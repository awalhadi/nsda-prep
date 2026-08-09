export type QuestionType = "mcq" | "card";

export interface MCQQuestion {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answerIndex: number;
  topic: string;
  source: string;
}

export interface CardQuestion {
  id: string;
  type: "card";
  question: string;
  answer: string;
  topic: string;
  source: string;
}

export type AnyQuestion = MCQQuestion | CardQuestion;

export interface ModuleMeta {
  id: string;
  title: string;
  kind: "mcq" | "flashcards";
  icon: string;
  count: number;
}
