import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TopNav from "@/components/TopNav";
import ConceptCard from "@/components/cbta/ConceptCard";
import { CONCEPT_INDEX, getConcept, getIndexEntry } from "@/data/cbta/loader";

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
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-5 sm:px-6">
        <Link href={`/cbta/cblm/${c.cblmPrimary}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-text-muted hover:text-teal">
          <ArrowLeft size={14} aria-hidden /> CBLM {c.cblmPrimary}
        </Link>
        <ConceptCard c={c} />
      </main>
    </>
  );
}
