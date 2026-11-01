import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import { HighlightMark, Stars, StatusBadge } from "@/components/cbta/Badges";
import { CBLMS, getCblm, getIndexEntry } from "@/data/cbta/loader";

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
  const concepts = cblm.conceptIds.map(getIndexEntry).filter((c) => c !== undefined);
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-5">
        <header className="rounded-2xl border border-border-subtle bg-surface p-5">
          <p className="font-mono-tag text-xs text-teal">CBLM {cblm.n}</p>
          <h1 className="font-display text-2xl font-bold">{cblm.title}</h1>
          {cblm.hasPdf ? (
            <p className="mt-1 text-sm text-text-muted">
              {cblm.covered} of {cblm.highlights} highlighted passages covered · {concepts.length} concept{concepts.length === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-rose">No CBLM PDF: concepts come from past exam questions only.</p>
          )}
        </header>
        {concepts.length === 0 ? (
          <p className="text-text-muted">No concepts written for this CBLM yet.</p>
        ) : (
          <ul className="space-y-2">
            {concepts.map((c) => (
              <li key={c.id}>
                <Link href={`/cbta/concept/${c.id}`} className="block min-h-11 rounded-xl border border-border-subtle bg-surface p-4 hover:border-teal/60 transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.title}</span>
                    <Stars n={c.stars} />
                    {c.highlighted && <HighlightMark />}
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{c.oneLine}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
