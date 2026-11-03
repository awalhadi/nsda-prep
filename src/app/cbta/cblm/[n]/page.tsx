import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ClipboardCheck, GraduationCap, Zap } from "lucide-react";
import TopicList, { type TopicGroupItem } from "@/components/cbta/TopicList";
import { norm } from "@/lib/cbta/norm";
import { CBLMS, getCblm, getGuide, getIndexEntry, topicHref } from "@/data/cbta/loader";

export const dynamicParams = false;

export function generateStaticParams() {
  return CBLMS.map((c) => ({ n: String(c.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const c = getCblm(Number(n));
  return c ? { title: `CBLM ${c.n}: ${c.title} · CBT&A L4` } : {};
}

export default async function CblmPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const cblm = getCblm(Number(n));
  if (!cblm) notFound();
  const guide = getGuide(cblm.n);
  const groups: TopicGroupItem[] = cblm.groups.map((g) => ({
    label: g.label, title: g.title, title_bn: g.title_bn,
    topics: g.topics.map((t) => {
      const card = t.concept ? getIndexEntry(t.concept) : undefined;
      return {
        id: t.id, href: topicHref(cblm.n, t), title: t.title, title_bn: t.title_bn,
        search: norm([t.title, t.title_bn ?? "", ...(card?.aliases ?? []), ...(card?.keywords.flatMap((k) => [k.en, k.bn]) ?? [])].join(" ")),
      };
    }),
  }));
  const count = groups.reduce((s, g) => s + g.topics.length, 0);
  const extras = guide ? [
    { href: `/cbta/cblm/${cblm.n}/self-check`, Icon: ClipboardCheck, title: `Self Check questions (${guide.selfChecks.length})`, bn: "CBLM-এর আসল প্রশ্ন ও উত্তর" },
    { href: `/cbta/cblm/${cblm.n}/practice`, Icon: GraduationCap, title: "Practice test", bn: "MCQ, matching আর viva" },
    { href: `/cbta/cblm/${cblm.n}/last-minute`, Icon: Zap, title: "Last-minute sheet", bn: "পরীক্ষার আগে ৫ মিনিট" },
  ] : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-4 text-ink sm:px-6">
      <div>
        <Link href="/cbta" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
          <ArrowLeft size={15} aria-hidden /> All CBLMs
        </Link>
        <header className="px-1">
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand">CBLM {cblm.n}</p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{cblm.title}</h1>
          {guide && <p lang="bn" className="mt-1 text-[16px] text-ink-2">{guide.title_bn}</p>}
          <p lang="bn" className="mt-2 text-[15px] text-ink-3">
            {count ? `এই CBLM-এ ${count}টি topic। ওপর থেকে একটা একটা করে পড়ুন।` : "এই CBLM-এর topic তৈরি হচ্ছে।"}
          </p>
        </header>
      </div>

      {count > 0 && <TopicList groups={groups} />}

      {extras.length > 0 && (
        <section aria-label="After the topics" className="space-y-2.5">
          <h2 lang="bn" className="px-1 text-[17px] font-extrabold">সব topic পড়া শেষ? এবার যাচাই করুন</h2>
          {extras.map(({ href, Icon, title, bn }) => (
            <Link key={href} href={href} className="flex min-h-16 items-center gap-3.5 rounded-2xl border-2 border-line bg-card px-4 py-3 hover:border-brand">
              <Icon size={22} className="shrink-0 text-brand" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold">{title}</span>
                <span lang="bn" className="block text-[14px] text-ink-2">{bn}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-line-strong" aria-hidden />
            </Link>
          ))}
        </section>
      )}
      {!cblm.hasPdf && (
        <p className="rounded-xl bg-danger-soft p-3 text-[14px] text-danger">No CBLM PDF is available. These topics come from past exam questions only.</p>
      )}
    </main>
  );
}
