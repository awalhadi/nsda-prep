import type { Metadata } from "next";
import Link from "next/link";
import { CBLMS, CONCEPT_INDEX, getConcept } from "@/data/cbta/loader";
import { SHORT_QUESTIONS } from "@/lib/cbta/short-questions";
import ShortQuestionsClient from "@/components/cbta/ShortQuestionsClient";

export const metadata: Metadata = { title: "সহজ প্রশ্নভান্ডার · CBT&A", description: "আপনার দেওয়া ৪২৮টি প্রশ্ন, টপিকের বাংলা নোট, সহজ উত্তর ও উদাহরণ।" };

export default function ShortQuestionsPage() {
  const ids = [...new Set(SHORT_QUESTIONS.flatMap((q) => q.conceptId ? [q.conceptId] : []))];
  const topics = Object.fromEntries(ids.flatMap((id) => {
    const c = getConcept(id);
    return c ? [[id, { title: c.title, cblm: c.cblmPrimary, bn: c.banglaExplanation, keywords: c.keywords, example: c.example.bn ?? c.example.en, memory: c.mnemonic?.explain_bn ?? null }]] : [];
  }));
  const linked = SHORT_QUESTIONS.filter((q) => q.conceptId).length;
  const simplified = SHORT_QUESTIONS.filter((q) => q.study).length;
  const priority = [...CONCEPT_INDEX].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 6);
  return <main className="mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-5 text-ink sm:px-6">
    <Link href="/cbta" lang="bn" className="inline-flex min-h-11 items-center font-semibold text-brand">← সব CBLM</Link>
    <header>
      <p className="text-sm font-bold text-brand">CBT&amp;A · QUESTION PRACTICE</p>
      <h1 lang="bn" className="mt-2 text-3xl font-extrabold">বুঝে পড়ি, মনে রাখি</h1>
      <p lang="bn" className="mt-3 text-lg text-ink-2">একই বিষয়ের প্রশ্ন টপিকের সঙ্গে পড়ুন। বাংলা দিয়ে বুঝুন, প্রয়োজনীয় English শব্দ শিখুন, তারপর না দেখে বলুন।</p>
    </header>
    <section className="rounded-2xl border border-sand-line bg-sand p-5">
      <h2 lang="bn" className="font-bold">এই সংগ্রহে কী আছে?</h2>
      <p lang="bn" className="mt-2 leading-relaxed">আপনার PDF-এর {SHORT_QUESTIONS.length}টি প্রশ্ন ও মূল উত্তর। {linked}টি প্রশ্ন সংশ্লিষ্ট টপিকের সঙ্গে যুক্ত; {simplified}টিতে আলাদা করে সহজ উত্তর ও উদাহরণ লেখা হয়েছে। বাকি যুক্ত প্রশ্নগুলোতে টপিকের বাংলা নোট পাবেন।</p>
      <p lang="bn" className="mt-2 text-sm text-ink-2">এটি শিক্ষার্থীর দেওয়া প্রশ্নসংগ্রহ; অফিসিয়াল NSDA প্রশ্নপত্র হিসেবে যাচাই করা হয়নি। এই সংগ্রহের পুনরাবৃত্তি দিয়ে পরীক্ষায় আসার সম্ভাবনা বা official priority বাড়ানো হয়নি।</p>
    </section>
    <section>
      <h2 lang="bn" className="text-xl font-extrabold">সময় কম? এই টপিকগুলো আগে ঝালাই করুন</h2>
      <p lang="bn" className="mt-1 text-sm text-ink-2">অ্যাপে সংরক্ষিত CBLM highlight, একাধিক CBLM-এ উপস্থিতি ও প্রশ্নের evidence score অনুযায়ী। এটি পরের পরীক্ষার পূর্বাভাস নয়।</p>
      <ol className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card px-4">
        {priority.map((c, i) => <li key={c.id}><Link href={`/cbta/concept/${c.id}`} className="flex min-h-14 items-center gap-3 py-3"><span className="font-bold text-brand">{i + 1}</span><span className="flex-1 font-semibold">{c.title}<span lang="bn" className="block text-sm font-normal text-ink-2">{c.keywords.slice(0, 2).map((k) => k.bn).join(" · ")}</span></span><span className="text-sm text-ink-3">CBLM {c.cblmPrimary}</span></Link></li>)}
      </ol>
    </section>
    <ShortQuestionsClient questions={SHORT_QUESTIONS} topics={topics} cblms={CBLMS.map((c) => ({ n: c.n, title: c.title }))} />
    <p lang="bn" className="text-sm text-ink-3">বর্তমান অনুমোদিত মডিউল মিলিয়ে দেখতে <a href="https://nsda.gov.bd/pages/files/6922db25933eb65569e089df" className="font-semibold text-brand underline">NSDA-এর CBT&amp;A Level 4 CBLM তালিকা</a> দেখুন। অ্যাপের CBLM নম্বর ও সরকারি file-এর ক্রম আলাদা হতে পারে; শিরোনাম মিলিয়ে নিন।</p>
  </main>;
}
