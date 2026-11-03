import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ConceptCard from "@/components/cbta/ConceptCard";
import CardActions from "@/components/cbta/CardActions";
import TopicNav from "@/components/cbta/TopicNav";
import { CONCEPT_INDEX, getConcept, getIndexEntry, topicPlace } from "@/data/cbta/loader";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONCEPT_INDEX.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getIndexEntry(id);
  return c ? { title: `${c.title} · CBT&A L4`, description: c.oneLine } : {};
}

export default async function ConceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConcept(id);
  if (!c) notFound();
  const place = topicPlace(c.cblmPrimary, (t) => t.concept === c.id);
  return (
    <main className="mx-auto max-w-3xl space-y-3 px-4 pb-20 pt-4 sm:px-6">
      <Link href={`/cbta/cblm/${c.cblmPrimary}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
        <ArrowLeft size={15} aria-hidden /> All topics of CBLM {c.cblmPrimary}
      </Link>
      <ConceptCard c={c} place={place} />
      <div className="flex justify-center pt-1"><CardActions conceptId={c.id} /></div>
      {place && <TopicNav cblm={c.cblmPrimary} prev={place.prev} next={place.next} />}
    </main>
  );
}
