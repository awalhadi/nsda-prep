import Link from "next/link";
import { questionsForConcept } from "@/lib/cbta/short-questions";
import ShortQuestionAnswer from "./ShortQuestionAnswer";

export default function TopicShortQuestions({ conceptId }: { conceptId: string }) {
  const questions = questionsForConcept(conceptId);
  if (!questions.length) return null;
  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h2 lang="bn" className="text-lg font-extrabold">এই টপিকের প্রশ্ন ({questions.length})</h2>
      <p lang="bn" className="mt-1 text-sm text-ink-2">আপনার দেওয়া PDF থেকে। প্রশ্নের ধরন বুঝুন, আগে নিজে বলুন, তারপর উত্তর খুলুন।</p>
      <div className="mt-4 divide-y divide-line">
        {questions.map((q) => <details key={q.id} className="py-3">
          <summary className="min-h-11 cursor-pointer font-semibold">{q.id}. {q.question}</summary>
          <div className="mt-3"><ShortQuestionAnswer q={q} /></div>
        </details>)}
      </div>
      <Link href="/cbta/questions" lang="bn" className="mt-3 inline-flex min-h-11 items-center font-bold text-brand">সব প্রশ্নে খুঁজুন →</Link>
    </section>
  );
}
