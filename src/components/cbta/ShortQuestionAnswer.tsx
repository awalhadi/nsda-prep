import type { ShortQuestion } from "@/lib/cbta/short-questions";

export default function ShortQuestionAnswer({ q }: { q: ShortQuestion }) {
  return (
    <div className="space-y-3 text-[16px] leading-relaxed">
      {q.reviewNote && <p lang="bn" className="rounded-xl border border-sand-line bg-sand p-3 text-ink">{q.reviewNote}</p>}
      {q.study && <>
        <div className="rounded-xl bg-sand p-4">
          <h3 lang="bn" className="font-bold">সহজ করে বুঝি</h3>
          <p lang="bn" className="mt-1">{q.study.bn}</p>
          <p lang="bn" className="mt-3 text-ink-2"><strong>উদাহরণ: </strong>{q.study.example}</p>
        </div>
        <div className="rounded-xl bg-brand-soft p-4">
          <h3 className="font-bold text-brand-ink">Simple English · ছোট উত্তর</h3>
          <p className="mt-1">{q.study.answer}</p>
        </div>
      </>}
      <details className="rounded-xl border border-line bg-card p-3">
        <summary lang="bn" className="min-h-11 cursor-pointer content-center font-semibold">মূল PDF-এর উত্তর {q.study ? "মিলিয়ে দেখুন" : "দেখুন"}</summary>
        <p className="mt-2 whitespace-pre-line text-ink-2">{q.sourceAnswer}</p>
        <p lang="bn" className="mt-3 text-sm text-ink-3">শিক্ষার্থীর দেওয়া সংগ্রহ · প্রশ্ন {q.id} · PDF পৃষ্ঠা {q.sourcePage} · অফিসিয়াল প্রশ্নপত্র হিসেবে যাচাই করা হয়নি।</p>
      </details>
    </div>
  );
}
