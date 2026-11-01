import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileWarning } from "lucide-react";
import TopNav from "@/components/TopNav";
import ConceptTile from "@/components/cbta/ConceptTile";
import Ring from "@/components/cbta/Ring";
import { PRIORITY } from "@/components/cbta/Badges";
import { CBLMS, getCblm, getIndexEntry } from "@/data/cbta/loader";
import type { GenIndexEntry } from "@/lib/cbta/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return CBLMS.map((c) => ({ n: String(c.n) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const c = getCblm(Number(n));
  return c ? { title: `CBLM ${c.n}: ${c.title} · CBT&A L4` } : {};
}

const GROUPS = [
  { stars: 3 as const, emoji: "🔥" },
  { stars: 2 as const, emoji: "⭐" },
  { stars: 1 as const, emoji: "📘" },
];

export default async function CblmPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const cblm = getCblm(Number(n));
  if (!cblm) notFound();
  const concepts = cblm.conceptIds.map(getIndexEntry).filter((c): c is GenIndexEntry => c !== undefined);
  const coverage = cblm.highlights ? (cblm.covered / cblm.highlights) * 100 : 0;
  const asked = concepts.reduce((s, c) => s + c.asked, 0);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-5 sm:px-6">
        <Link href="/cbta" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-text-muted hover:text-teal">
          <ArrowLeft size={14} aria-hidden /> All CBLMs
        </Link>

        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-teal/15 via-surface to-surface p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-teal/10 blur-3xl" />
          <div className="relative flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <span className="inline-flex h-9 items-center rounded-full bg-teal/15 px-3 font-display text-sm font-bold text-teal">CBLM {cblm.n}</span>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{cblm.title}</h1>
            </div>
            {cblm.hasPdf && <Ring value={coverage} label="covered" />}
          </div>
          {cblm.hasPdf ? (
            <dl className="relative mt-5 grid grid-cols-3 gap-2 text-center">
              {[["Concepts", concepts.length], ["Must read", concepts.filter((c) => c.stars === 3).length], ["Exam questions", asked]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-black/25 px-2 py-2.5">
                  <dd className="font-display text-xl font-bold">{v}</dd>
                  <dt className="text-[11px] text-text-faint">{k}</dt>
                </div>
              ))}
            </dl>
          ) : (
            <p className="relative mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">
              <FileWarning size={16} aria-hidden /> No CBLM PDF. Concepts here come from past exam questions only.
            </p>
          )}
          {cblm.hasPdf && (
            <p className="relative mt-3 text-xs text-text-faint">
              {cblm.covered} of {cblm.highlights} highlighted passages are covered by these concepts.
            </p>
          )}
        </header>

        {concepts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-text-muted">
            <p className="font-display text-lg">Coming soon</p>
            <p lang="bn" className="mt-1 text-sm">এই CBLM-এর কার্ড এখনো তৈরি হচ্ছে।</p>
          </div>
        ) : (
          GROUPS.map(({ stars, emoji }) => {
            const list = concepts.filter((c) => c.stars === stars);
            if (!list.length) return null;
            const p = PRIORITY[stars];
            return (
              <section key={stars} aria-labelledby={`g${stars}`}>
                <h2 id={`g${stars}`} className="mb-3 flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold">{emoji} {p.label}</span>
                  <span lang="bn" className="text-sm text-text-faint">{p.bn}</span>
                  <span className="ml-auto text-xs text-text-faint">{list.length}</span>
                </h2>
                <ul className="space-y-2.5">
                  {list.map((c) => <li key={c.id}><ConceptTile c={c} /></li>)}
                </ul>
              </section>
            );
          })
        )}
      </main>
    </>
  );
}
