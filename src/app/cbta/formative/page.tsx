import Link from "next/link";
import bank from "@/data/cbta/formative.json";
import { getConcept } from "@/data/cbta/loader";

export const metadata = { title: "Formative প্রশ্ন ও সহজ উত্তর" };
const name = (q: typeof bank[number]) => q.ict || getConcept(q.topic)!.title;
const topics = Array.from(new Set(bank.map(name))).map((title) => {
  const rows = bank.filter((q) => name(q) === title);
  const sets = new Set(rows.flatMap((q) => q.sources.map((s) => ["04","05"].includes(s.set) ? "04/05" : s.set)));
  return { title, rows, sets: [...sets].sort() };
}).sort((a,b) => b.sets.length - a.sets.length || b.rows.length - a.rows.length || a.title.localeCompare(b.title));

export default function FormativePage() {
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
    <Link href="/cbta/questions" className="study-secondary">← প্রশ্নভান্ডার</Link>
    <h1 className="text-3xl font-bold">Formative প্রশ্ন ও সহজ উত্তর</h1>
    <p lang="bn">৭টি সেটের ১৭৫টি প্রশ্ন মিলিয়ে {bank.length.toLocaleString("bn-BD")}টি আলাদা অনুশীলন। একই প্রশ্ন একবার পড়লেই তার সব উৎস দেখা যাবে।</p>
    <p lang="bn">অগ্রাধিকার গুনতে ০৪ ও ০৫ একসঙ্গে ধরা হয়েছে, কারণ দুটির ২০টি প্রশ্ন একই। নিচের সংখ্যা এই নমুনায় বিষয়টির উপস্থিতি বোঝায়।</p>
    <a className="study-secondary" href="/formative-study-guide.md" download>সম্পূর্ণ প্রশ্নোত্তর ডাউনলোড</a>
    <section className="study-panel"><h2 className="text-xl font-bold">একাধিক সেটে আসা বিষয়</h2><ul className="mt-2 list-disc ps-5">{topics.filter(t => t.sets.length > 1).map(t => <li key={t.title}><a className="text-brand underline" href={`#topic-${topics.indexOf(t)}`}>{t.title}</a> · {t.sets.join(", ")}</li>)}</ul></section>
    {topics.map((t,i) => <section id={`topic-${i}`} key={t.title} className="study-panel scroll-mt-24">
      <h2 className="text-xl font-bold">{t.title}</h2>
      <p className="mb-2 text-sm">সেট {t.sets.join(", ")} · {t.rows.length}টি প্রশ্ন</p>
      {!t.rows[0].ict && <Link className="study-secondary" href={`/cbta/concept/${t.rows[0].topic}`}>বাংলায় টপিক ও CBLM সূত্র পড়ুন</Link>}
      {t.rows.map(q => <article key={q.question} className="space-y-2 border-t border-line py-4">
        <p className="text-sm text-ink-2">{q.sources.map(s => `Set ${s.set} · Q${s.n} · পৃ. ${s.page}`).join(" / ")}</p>
        <h3 className="font-bold">{q.question}</h3>
        {q.options && <p className="whitespace-pre-line">{q.options}</p>}
        <details><summary className="min-h-11 cursor-pointer font-semibold text-brand">নিজে বলুন, তারপর উত্তর দেখুন</summary>
          <p className="rounded-xl bg-brand-soft p-3">{q.answer}</p>
          <p className="mt-2 text-sm">{q.sources.some(s => s.key) ? "সরবরাহ করা key মিলিয়ে সহজ উত্তর" : "তৈরি করা নমুনা উত্তর"}{q.ict && " · ICT-এর মূল CBLM PDF সংগ্রহে নেই"}</p>
          {q.note && <p className="text-sm">{q.note}</p>}
          {q.external && <a className="underline" href={q.external}>সরকারি সূত্র</a>}
        </details>
      </article>)}
    </section>)}
  </main>;
}
