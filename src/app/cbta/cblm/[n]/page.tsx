import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

export default async function CblmPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const cblm = getCblm(Number(n));
  if (!cblm) notFound();
  const concepts = cblm.conceptIds.map(getIndexEntry).filter((c): c is GenIndexEntry => c !== undefined);
  const coverage = cblm.highlights ? (cblm.covered / cblm.highlights) * 100 : 0;
  const asked = concepts.reduce((s, c) => s + c.asked, 0);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pb-20 pt-4 sm:px-6">
      <div>
        <Link href="/cbta" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
          <ArrowLeft size={15} aria-hidden /> All CBLMs
        </Link>
        <header className="mt-1 rounded-2xl border border-line bg-card p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand">CBLM {cblm.n}</p>
              <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{cblm.title}</h1>
            </div>
            {cblm.hasPdf && concepts.length > 0 && <Ring value={coverage} label="covered" />}
          </div>
          {cblm.hasPdf ? (
            <>
              <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
                {[["concepts", concepts.length], ["must read", concepts.filter((c) => c.stars === 3).length], ["exam questions", asked]].map(([k, v]) => (
                  <div key={k} className="px-2 py-3">
                    <dd className="text-xl font-extrabold">{v}</dd>
                    <dt className="text-[12px] text-ink-3">{k}</dt>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[13px] text-ink-3">
                {cblm.covered} of {cblm.highlights} highlighted parts of this CBLM are explained in these concepts.
              </p>
            </>
          ) : (
            <p className="mt-4 rounded-xl bg-danger-soft p-3 text-[14px] text-danger">
              No CBLM PDF is available. Concepts here come from past exam questions only.
            </p>
          )}
        </header>
      </div>

      {concepts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center">
          <p className="text-lg font-bold text-ink-2">Cards coming soon</p>
          <p lang="bn" className="mt-1 text-[15px] text-ink-3">এই CBLM-এর কার্ড তৈরি হচ্ছে। সব highlighted topic থাকবে।</p>
        </div>
      ) : (
        ([3, 2, 1] as const).map((stars) => {
          const list = concepts.filter((c) => c.stars === stars);
          if (!list.length) return null;
          const p = PRIORITY[stars];
          return (
            <section key={stars} aria-labelledby={`g${stars}`}>
              <h2 id={`g${stars}`} className="mb-3 flex items-baseline gap-2.5 border-b border-line pb-2">
                <span className="text-[18px] font-extrabold">{p.label}</span>
                <span lang="bn" className="text-[14px] text-ink-3">{p.bn}</span>
                <span className="ml-auto text-[13px] font-semibold text-ink-3">{list.length}</span>
              </h2>
              <ul className="space-y-2.5">
                {list.map((c) => <li key={c.id}><ConceptTile c={c} /></li>)}
              </ul>
            </section>
          );
        })
      )}
    </main>
  );
}
