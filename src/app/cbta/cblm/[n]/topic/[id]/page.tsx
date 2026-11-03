import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CBLMS, getGuide, topicPlace } from "@/data/cbta/loader";
import { GuideBlockView } from "@/components/cbta/guide/Blocks";
import SourcesFooter from "@/components/cbta/SourcesFooter";
import TopicNav from "@/components/cbta/TopicNav";

// Guide-only topics: learning outcomes, Job sheets, sample forms. Card topics live at /cbta/concept/[id].

export const dynamicParams = false;

function findTopic(n: number, id: string) {
  for (const s of getGuide(n)?.sections ?? []) for (const t of s.topics) if (t.id === id && !t.concept) return { s, t };
  return null;
}

export function generateStaticParams() {
  return CBLMS.flatMap((c) => (getGuide(c.n)?.sections ?? []).flatMap((s) => s.topics.filter((t) => !t.concept).map((t) => ({ n: String(c.n), id: t.id }))));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string; id: string }> }): Promise<Metadata> {
  const { n, id } = await params;
  const f = findTopic(Number(n), id);
  return f ? { title: `${f.t.title} · CBLM ${n} · CBT&A L4` } : {};
}

export default async function GuideTopicPage({ params }: { params: Promise<{ n: string; id: string }> }) {
  const { n, id } = await params;
  const cblm = Number(n);
  const f = findTopic(cblm, id);
  if (!f) notFound();
  const place = topicPlace(cblm, (t) => t.id === id);
  return (
    <main className="mx-auto max-w-3xl space-y-3.5 px-4 pb-20 pt-4 text-ink sm:px-6">
      <Link href={`/cbta/cblm/${cblm}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
        <ArrowLeft size={15} aria-hidden /> All topics of CBLM {cblm}
      </Link>
      <header className="px-1">
        <p className="text-[13px] font-semibold text-ink-3">CBLM {cblm} · {f.s.label}{place ? ` · Topic ${place.index + 1} of ${place.total}` : ""}</p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{f.t.title}</h1>
        <p lang="bn" className="mt-1 text-[16px] text-ink-2">{f.t.title_bn}</p>
      </header>
      <section className="space-y-6 rounded-2xl border border-line bg-card p-5 sm:p-6">
        {f.t.blocks.map((b, i) => <GuideBlockView key={i} b={b} />)}
      </section>
      <SourcesFooter from={f.t.blocks} />
      {place && <TopicNav cblm={cblm} prev={place.prev} next={place.next} />}
    </main>
  );
}
