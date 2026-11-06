import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import OfflineButton from "@/components/cbta/OfflineButton";
import SearchClient from "@/components/cbta/SearchClient";
import StudyDashboard from "@/components/cbta/StudyDashboard";
import { CBLMS, CONCEPT_INDEX, CONTENT_VERSION, getGuide } from "@/data/cbta/loader";

export const metadata: Metadata = { title: "আজকের পড়া · CBT&A Level 4", description: "বাংলায় বুঝুন, নিজের অগ্রগতি দেখুন, প্রতিদিনের ছোট study plan দিয়ে প্রস্তুতি নিন।" };
export default function CbtaHome() {
  const guides = CBLMS.map((c) => ({ n: c.n, guide: getGuide(c.n) }));
  const concepts = CONCEPT_INDEX.map((c) => ({ id: c.id, title: c.title, score: c.score, cblms: c.cblms, bn: guides.flatMap((g) => g.guide?.sections.flatMap((s) => s.topics) ?? []).find((t) => t.concept === c.id)?.title_bn ?? "" }));
  const courses = CBLMS.map((c) => ({ n: c.n, title: c.title, bn: guides.find((g) => g.n === c.n)?.guide?.title_bn ?? "", concepts: c.conceptIds, topics: c.groups.reduce((s, g) => s + g.topics.length, 0) }));
  return <main className="mx-auto max-w-6xl space-y-7 px-4 pb-8 pt-6 sm:px-7 sm:pt-8 lg:px-9">
    <StudyDashboard concepts={concepts} courses={courses} />
    <section className="study-panel"><h2 lang="bn" className="mb-3 text-xl font-bold">নির্দিষ্ট কিছু খুঁজছেন?</h2><SearchClient index={CONCEPT_INDEX} autoFocus={false} /></section>
    <Link href="/cbta/questions" className="study-panel flex items-center gap-4 hover:border-brand"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><ClipboardCheck size={23} /></span><span className="flex-1"><span lang="bn" className="block text-lg font-bold">৪২৮টি প্রশ্ন, টপিকের পাশে</span><span lang="bn" className="mt-1 block text-sm text-ink-2">সহজ উত্তর, বাংলা নোট ও উদাহরণ দিয়ে প্রস্তুতি যাচাই করুন।</span></span><ArrowRight size={20} className="shrink-0 text-brand" /></Link>
    <div id="offline-study" className="scroll-mt-24"><OfflineButton version={`${CONTENT_VERSION}-design-v2`} /></div>
  </main>;
}
