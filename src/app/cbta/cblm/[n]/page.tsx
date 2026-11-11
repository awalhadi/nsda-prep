import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ClipboardCheck, GraduationCap, Zap } from "lucide-react";
import TopicList, { type TopicGroupItem } from "@/components/cbta/TopicList";
import { moduleIntroductions, studyModules } from "@/data/cbta/study-priorities";
import { norm } from "@/lib/cbta/norm";
import { CBLMS, getCblm, getGuide, getIndexEntry, lessonCount, lessonGroups, topicHref, topicKind } from "@/data/cbta/loader";

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
  const introduction = moduleIntroductions[cblm.n];
  const study = studyModules.find((module) => module.n === cblm.n);
  const refs = cblm.groups.flatMap((group) => group.topics);
  const overview = refs.filter((topic) => topicKind(topic) === "intro");
  const help = refs.find((topic) => topicKind(topic) === "help");
  const lessons = lessonGroups(cblm);
  const count = lessonCount(lessons);
  const groups: TopicGroupItem[] = lessons.map((g) => ({
    label: g.label, title: g.title, title_bn: g.title_bn,
    topics: g.topics.map((t) => {
      const card = t.concept ? getIndexEntry(t.concept) : undefined;
      return {
        id: t.id, href: topicHref(cblm.n, t), title: t.title, title_bn: t.title_bn,
        search: norm([t.title, t.title_bn ?? "", ...(card?.aliases ?? []), ...(card?.keywords.flatMap((k) => [k.en, k.bn]) ?? [])].join(" ")),
      };
    }),
  }));
  const extras = guide ? [
    { href: `/cbta/cblm/${cblm.n}/self-check`, Icon: ClipboardCheck, title: `Self Check questions (${guide.selfChecks.length})`, bn: "CBLM-এর আসল প্রশ্ন ও উত্তর" },
    { href: `/cbta/cblm/${cblm.n}/practice`, Icon: GraduationCap, title: "Practice test", bn: "MCQ, matching আর viva" },
    { href: `/cbta/cblm/${cblm.n}/last-minute`, Icon: Zap, title: "Last-minute sheet", bn: "পরীক্ষার আগে ৫ মিনিট" },
  ] : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 pb-20 pt-4 text-ink sm:px-6">
      <div>
        <Link href="/cbta/courses" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
          <ArrowLeft size={15} aria-hidden /> সব CBLM
        </Link>
        <header className="px-1">
          <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand">CBLM {cblm.n}</p>
          <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{cblm.title}</h1>
          {guide && <p lang="bn" className="mt-1 text-[16px] text-ink-2">{guide.title_bn}</p>}
        </header>
      </div>

      <section lang="bn" className="study-panel">
        <p className="text-sm font-semibold text-brand">১ · মডিউল পরিচিতি</p>
        <h2 className="mt-1 text-xl font-bold">{introduction.title}</h2>
        <p className="mt-2 text-ink-2">{introduction.goal}</p>
        {overview.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
          {overview.map((topic) => (
            <Link key={topic.id} href={topicHref(cblm.n, topic)} className="study-secondary text-sm">{topic.title_bn ?? topic.title}</Link>
          ))}
        </div>}
      </section>

      {study && study.topics.length > 0 && (
        <section id="priority-topics" lang="bn" className="study-panel scroll-mt-24 border-brand/25">
          <p className="text-sm font-semibold text-brand">২ · পরীক্ষার প্রস্তুতি</p>
          <h2 className="mt-1 text-xl font-bold">আগে এই {Math.min(study.topics.length, 5)}টি টপিক পড়ুন</h2>
          <p className="mt-2 text-sm text-ink-2">এগুলো নিচের পূর্ণ পাঠ থেকেই বাছাই করা। প্রশ্নের প্রমাণ, চিহ্নিত অংশ ও অন্য মডিউলে ব্যবহারের ভিত্তিতে ক্রম সাজানো।</p>
          <ol className="mt-3 divide-y divide-line">
            {study.topics.slice(0, 5).map((topic, i) => {
              const name = refs.find((ref) => ref.concept === topic.id)?.title_bn;
              const sharedWith = study.overlaps.filter((other) => other.topics.some((item) => item.id === topic.id));
              return (
                <li key={topic.id}>
                  <Link href={`/cbta/concept/${topic.id}`} className="flex min-h-12 items-start gap-3 rounded-lg py-3 hover:bg-paper">
                    <span className="rounded-lg bg-brand-soft px-2 py-1 text-sm font-bold text-brand-ink">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{name || topic.title}</span>
                      {name && <span lang="en" className="block text-sm text-ink-2">{topic.title}</span>}
                      <span className="mt-1 block text-xs text-ink-3">
                        {topic.asked > 0 && `${topic.asked}টি যুক্ত প্রশ্ন বা Self Check`}
                        {sharedWith.length > 0 && `${topic.asked ? " · " : ""}CBLM ${sharedWith.map((other) => other.n).join(", ")}-এও আছে`}
                        {!topic.asked && !sharedWith.length && (topic.highlighted ? "CBLM-এ চিহ্নিত" : "মডিউলের ভিত্তি পড়া")}
                      </span>
                    </span>
                    <ChevronRight size={17} className="mt-2 shrink-0 text-brand" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link href={`/cbta/must-know#cblm-${cblm.n}`} className="mr-4 mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand">Must Know</Link>
          <Link href="/cbta/guide" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand">সব CBLM-এর অগ্রাধিকার ও মিল দেখুন →</Link>
        </section>
      )}

      {count > 0 && (
        <details className="study-panel">
          <summary lang="bn" className="min-h-11 cursor-pointer content-center font-bold">৩ · পূর্ণ পাঠ ও জব শিট ({count.toLocaleString("bn-BD")}টি)</summary>
          <p lang="bn" className="mb-3 text-sm text-ink-2">এখানে মূল পাঠ, উদাহরণ ও জব শিট মডিউলের ক্রমে আছে। ওপরের আগে পড়ার টপিকগুলোও এই তালিকায় পাবেন।</p>
          <TopicList groups={groups} />
        </details>
      )}

      {extras.length > 0 && (
        <section aria-label="After the topics" className="space-y-2.5">
          <h2 lang="bn" className="px-1 text-[17px] font-extrabold">৪ · পড়ে নিজেকে যাচাই করুন</h2>
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
      {help && (
        <Link href={topicHref(cblm.n, help)} lang="bn" className="inline-flex min-h-11 items-center text-sm font-semibold text-ink-2 underline">পড়ার গাইড ব্যবহারের সহায়তা</Link>
      )}
      {!cblm.hasPdf && (
        <p className="rounded-xl bg-danger-soft p-3 text-[14px] text-danger">ICT মডিউলের PDF এই অ্যাপে নেই। এখানে প্রশ্নসেট থেকে তৈরি ২টি কার্ড আছে।</p>
      )}
    </main>
  );
}
