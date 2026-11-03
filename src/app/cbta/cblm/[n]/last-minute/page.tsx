import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide } from "@/data/cbta/loader";
import ExtraPage, { guideParams } from "@/components/cbta/guide/ExtraPage";
import SourcesFooter from "@/components/cbta/SourcesFooter";

export const dynamicParams = false;
export const generateStaticParams = guideParams;

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  return { title: `Last-minute sheet · CBLM ${(await params).n} · CBT&A L4` };
}

export default async function LastMinutePage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const g = getGuide(n);
  if (!g) notFound();
  return (
    <ExtraPage cblm={n} title="Last-minute sheet" titleBn="পরীক্ষার আগে ৫ মিনিটে পুরো CBLM একবার দেখে নিন।">
      <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {g.revision.map((r) => (
          <div key={r.topic} className="px-4 py-3.5">
            <dt className="font-extrabold">{r.concept ? <Link href={`/cbta/concept/${r.concept}`} className="hover:text-brand">{r.topic}</Link> : r.topic}</dt>
            <dd className="mt-0.5 text-[15.5px] text-ink-2">{r.answer.text}</dd>
          </div>
        ))}
      </dl>
      <SourcesFooter from={g.revision} />
    </ExtraPage>
  );
}
