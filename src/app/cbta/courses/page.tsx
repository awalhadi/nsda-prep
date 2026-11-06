import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CBLMS, getGuide } from "@/data/cbta/loader";
export const metadata = { title: "সব CBLM · CBT&A" };
export default function CoursesPage() {
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-7"><header><p className="study-eyebrow">YOUR LEARNING LIBRARY</p><h1 lang="bn" className="mt-2 text-3xl font-extrabold">সব CBLM, এক জায়গায়।</h1><p lang="bn" className="mt-2 text-ink-2">একটি মডিউল বেছে বাংলায় বুঝুন, উদাহরণ দেখুন, তারপর নিজেকে যাচাই করুন।</p></header><Link href="/cbta/guide" lang="bn" className="study-secondary">সময় কম? পড়ার অগ্রাধিকার দেখুন →</Link><div className="grid gap-4 sm:grid-cols-2">{CBLMS.map((c) => <Link key={c.n} href={`/cbta/cblm/${c.n}`} className="study-panel hover:border-brand"><div className="mb-4 flex items-center justify-between"><span className="rounded-lg bg-brand-soft px-3 py-1 text-sm font-bold text-brand-ink">CBLM {c.n}</span><ArrowUpRight size={18} className="text-ink-3" /></div><h2 className="text-lg font-bold">{c.title}</h2><p lang="bn" className="mt-1 text-sm text-ink-2">{getGuide(c.n)?.title_bn}</p><p lang="bn" className="mt-4 text-sm text-ink-3">{c.groups.reduce((n, g) => n + g.topics.length, 0)}টি টপিক · বাংলা সহায়তা</p></Link>)}</div></main>;
}
