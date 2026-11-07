import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { byQuestionEvidence, bySharedTopics, combinedCoverage, moduleIntroductions, reusePair } from "@/data/cbta/study-priorities";

export const metadata: Metadata = { title: "কোন CBLM আগে পড়ব? · CBT&A" };

export default function GuidePage() {
  const highest = byQuestionEvidence[0].papers;
  const first = byQuestionEvidence[0];
  const sharedLeaders = bySharedTopics.filter((module) => module.shared.length === bySharedTopics[0].shared.length);
  const assessmentPlan = combinedCoverage([11, 12]);

  return (
    <main lang="bn" className="mx-auto max-w-5xl space-y-7 px-4 py-7 sm:px-7">
      <header>
        <p className="study-eyebrow">CBT&amp;A LEVEL 4</p>
        <h1 className="mt-2 text-3xl font-extrabold">কোন CBLM আগে পড়ব?</h1>
        <p className="mt-2 text-ink-2">প্রশ্নের প্রমাণ আর একাধিক মডিউলে কাজে লাগে এমন টপিক দেখে পড়ার ক্রম বেছে নিন।</p>
      </header>

      <section className="study-panel border-brand/25">
        <div className="flex items-center gap-2 text-brand-ink"><BookOpen size={20} aria-hidden /><h2 className="text-xl font-bold">সময় কম? এখান থেকে শুরু করুন</h2></div>
        <p className="mt-2 text-ink-2">প্রশ্নের নমুনা ধরে শুরু করতে CBLM {first.n} পড়ুন। মূল্যায়নের ধারাবাহিকতা শিখতে ১১-তে পরিকল্পনা বুঝুন, তারপর ১২-তে মূল্যায়ন নেওয়া শিখুন। এই দুই মডিউলের {assessmentPlan.total}টি আলাদা কার্ডের মধ্যে {assessmentPlan.outside}টি অন্য CBLM-এও তালিকাভুক্ত।</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/cbta/cblm/${first.n}#priority-topics`} className="study-primary">CBLM {first.n} দিয়ে শুরু <ArrowRight size={16} aria-hidden /></Link>
          {assessmentPlan.numbers.map((n, i) => <Link key={n} href={`/cbta/cblm/${n}#priority-topics`} className="study-secondary">{i + 1}. CBLM {n} পড়ুন <ArrowRight size={16} aria-hidden /></Link>)}
        </div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="study-panel">
          <h2 className="text-xl font-bold">প্রশ্নে বেশি দেখা CBLM</h2>
          <p className="mt-2 text-sm text-ink-2">অ্যাপে থাকা প্রশ্নপত্র ও প্রশ্নসেটের আলাদা প্রশ্নের সংখ্যা। একই প্রশ্ন একটি মডিউলে একবার গোনা হয়েছে।</p>
          <ol className="mt-4 space-y-1">
            {byQuestionEvidence.map((module) => (
              <li key={module.n}>
                <Link href={`/cbta/cblm/${module.n}#priority-topics`} className="block rounded-lg p-2 hover:bg-paper">
                  <div className="flex justify-between gap-3 text-sm font-semibold"><span>{module.n}. {moduleIntroductions[module.n].title}</span><span className="shrink-0 tabular-nums">{module.papers} প্রশ্ন</span></div>
                  <div className="progress-track mt-2" aria-hidden><span style={{ width: `${highest ? module.papers / highest * 100 : 0}%` }} /></div>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="study-panel">
          <div className="flex items-center gap-2"><Layers size={20} className="text-brand" aria-hidden /><h2 className="text-xl font-bold">একবার পড়লে কোথায় কাজে লাগবে?</h2></div>
          <p className="mt-2 text-sm text-ink-2">এককভাবে CBLM {sharedLeaders.map((cblm) => cblm.n).join(" ও ")}-এ সবচেয়ে বেশি অভিন্ন কার্ড আছে।</p>
          <div className="mt-3 rounded-xl bg-brand-soft p-3 text-sm text-brand-ink">
            <p className="font-bold">দুটি বেছে পড়লে CBLM {reusePair.numbers.join(" ও ")}</p>
            <p className="mt-1">{reusePair.total}টি আলাদা কার্ডের মধ্যে {reusePair.outside}টি অন্য মডিউলেও আছে। সব জোড়া তুলনায় এই জোড়ায় সর্বোচ্চ মিল পাওয়া যায়, এবং সমান মিলের জোড়াগুলোর মধ্যে পড়ার কার্ড কম।</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {reusePair.numbers.map((n) => <Link key={n} href={`/cbta/cblm/${n}#priority-topics`} className="inline-flex min-h-11 items-center font-bold underline">CBLM {n} পড়ুন →</Link>)}
            </div>
          </div>
          <div className="mt-4 divide-y divide-line">
            {bySharedTopics.map((module) => (
              <details key={module.n} className="py-2">
                <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold">CBLM {module.n} · {moduleIntroductions[module.n].title} · {module.shared.length}টি অভিন্ন কার্ড</summary>
                <div className="space-y-2 pb-2 pl-4 text-sm text-ink-2">
                  {module.overlaps.length === 0 && <p>এই তালিকায় অন্য CBLM-এর সঙ্গে একই কার্ড পাওয়া যায়নি।</p>}
                  {module.overlaps.map((other) => (
                    <details key={other.n} className="rounded-lg bg-paper px-3 py-1">
                      <summary className="min-h-11 cursor-pointer content-center font-semibold">CBLM {other.n} · {other.topics.length}/{other.total}টি কার্ড অভিন্ন</summary>
                      <div className="progress-track my-2" aria-hidden><span style={{ width: `${other.topics.length / other.total * 100}%` }} /></div>
                      <ul className="space-y-1 pb-2">
                        {other.topics.map((topic) => <li key={topic.id}><Link className="inline-flex min-h-10 items-center text-brand underline" href={`/cbta/concept/${topic.id}`} lang="en">{topic.title}</Link></li>)}
                      </ul>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <details className="study-panel">
        <summary className="cursor-pointer font-bold">এই হিসাব কীভাবে পড়বেন?</summary>
        <p className="mt-3 text-sm text-ink-2">প্রশ্নের বারে মডিউলে যুক্ত প্রশ্নপত্র ও প্রশ্নসেটের নমুনা আছে। নমুনার সংখ্যা পরের পরীক্ষার সম্ভাবনা জানায় না। একটি প্রশ্ন একাধিক মডিউলের সঙ্গে যুক্ত থাকতে পারে।</p>
        <p className="mt-2 text-sm text-ink-2">অভিন্ন কার্ডের হিসাব অ্যাপের একই টপিক আইডি দিয়ে করা। আলাদা শেখার ফল, জব শিট ও অনুশীলন নিজ নিজ CBLM-এ পড়ুন। ICT মডিউলে এই অ্যাপে ২টি কার্ড আছে।</p>
      </details>
      <Link href="/cbta/courses" className="study-secondary">সব CBLM দেখুন <ArrowRight size={16} aria-hidden /></Link>
    </main>
  );
}
