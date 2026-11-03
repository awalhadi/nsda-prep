import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getIndexEntry } from "@/data/cbta/loader";
import ExtraPage, { guideParams } from "@/components/cbta/guide/ExtraPage";
import SourcesFooter from "@/components/cbta/SourcesFooter";

export const dynamicParams = false;
export const generateStaticParams = guideParams;

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  return { title: `Self Check questions · CBLM ${(await params).n} · CBT&A L4` };
}

export default async function SelfCheckPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const g = getGuide(n);
  if (!g) notFound();
  return (
    <ExtraPage cblm={n} title={`Self Check questions (${g.selfChecks.length})`} titleBn="CBLM-এর আসল প্রশ্ন। আগে খাতায় লিখুন, তারপর উত্তর মিলিয়ে নিন।">
      <ol className="space-y-3">
        {g.selfChecks.map((sc, i) => {
          const card = sc.concept ? getIndexEntry(sc.concept) : undefined;
          return (
            <li key={sc.question} className="overflow-hidden rounded-2xl border border-line bg-card">
              <div className="px-4 py-3.5">
                <p className="text-[12px] font-bold text-ink-3">Question {i + 1}</p>
                <p className="text-[17px] font-extrabold leading-snug">{sc.real?.question}</p>
                <p lang="bn" className="mt-0.5 text-[15px] text-ink-2">{sc.q_bn}</p>
              </div>
              <details className="group border-t border-line">
                <summary className="flex min-h-12 cursor-pointer list-none items-center px-4 text-[14.5px] font-bold text-brand">
                  <span className="group-open:hidden">Show the answer</span><span className="hidden group-open:inline">Hide the answer</span>
                </summary>
                <div className="space-y-3 px-4 pb-4">
                  <div className="whitespace-pre-line rounded-xl border-l-4 border-brand bg-brand-soft px-3.5 py-3 text-[16px]">
                    <span className="mb-1 block text-[12px] font-bold uppercase tracking-wider text-brand-ink">Write like this · <span lang="bn" className="normal-case tracking-normal">এভাবে লিখুন</span></span>
                    {sc.modelAnswer}
                  </div>
                  {sc.tip && <p className="text-[14.5px] text-ink-2">💡 {sc.tip}</p>}
                  {card && <Link href={`/cbta/concept/${card.id}`} className="inline-flex min-h-9 items-center text-[14px] font-bold text-brand hover:underline">Learn this topic: {card.title} →</Link>}
                  <SourcesFooter from={sc.keyPoints} />
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </ExtraPage>
  );
}
