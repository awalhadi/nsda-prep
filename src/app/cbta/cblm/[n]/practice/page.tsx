import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide } from "@/data/cbta/loader";
import ExtraPage, { guideParams } from "@/components/cbta/guide/ExtraPage";
import GuidePractice from "@/components/cbta/guide/GuidePractice";

export const dynamicParams = false;
export const generateStaticParams = guideParams;

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  return { title: `Practice test · CBLM ${(await params).n} · CBT&A L4` };
}

export default async function PracticePage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const g = getGuide(n);
  if (!g) notFound();
  return (
    <ExtraPage cblm={n} title="Practice test" titleBn="পুরো CBLM থেকে MCQ, matching আর viva।"
      intro="Practice questions made from the CBLM text. They are for revision, not a prediction of the exam paper.">
      <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <GuidePractice practice={g.practice} />
      </section>
    </ExtraPage>
  );
}
