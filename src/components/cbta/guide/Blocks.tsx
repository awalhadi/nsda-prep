// Study-guide blocks. Same colour rules as the topic page: green = what to write,
// red = cautions, sand = Bangla help. Tables stack into cards on phones.
// No inline page references: each page shows one SourcesFooter at the bottom.

import Link from "next/link";
import { ArrowDown, ArrowRight, CornerDownLeft, FileText, Lightbulb, TriangleAlert } from "lucide-react";
import type { GenCell, GenGuideBlock, GenVisual } from "@/lib/cbta/types";
import { getIndexEntry } from "@/data/cbta/loader";

function BlockTitle({ title, bn }: { title?: string; bn?: string }) {
  if (!title) return null;
  return (
    <h3 className="mb-3 flex flex-wrap items-baseline gap-x-2 text-[17px] font-extrabold text-ink">
      {title}
      {bn && <span lang="bn" className="text-[14px] font-medium text-ink-3">· {bn}</span>}
    </h3>
  );
}

function CellView({ cell }: { cell: GenCell }) {
  return typeof cell === "string" ? <>{cell}</> : <>{cell.text}</>;
}

export function GuideTable({ b }: { b: Extract<GenVisual, { kind: "table" }> }) {
  return (
    <div>
      <BlockTitle title={b.title} bn={b.title_bn} />
      {/* Wide screens: a real table. */}
      <div className="hidden overflow-hidden rounded-xl border border-line sm:block">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead className="bg-paper">
            <tr>{b.columns.map((c) => <th key={c} scope="col" className="border-b border-line px-3.5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-ink-3">{c}</th>)}</tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0 even:bg-paper/50">
                {r.map((cell, j) => (
                  <td key={j} className={`px-3.5 py-3 align-top ${j === 0 ? "font-bold text-ink" : "text-ink-2"}`}><CellView cell={cell} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phones: one card per row. */}
      <ul className="space-y-2.5 sm:hidden">
        {b.rows.map((r, i) => (
          <li key={i} className="rounded-xl border border-line bg-card p-3.5">
            <p className="font-bold text-ink"><CellView cell={r[0]} /></p>
            <dl className="mt-1.5 space-y-1.5">
              {r.slice(1).map((cell, j) => (
                <div key={j}>
                  <dt className="text-[11.5px] font-bold uppercase tracking-wide text-ink-3">{b.columns[j + 1]}</dt>
                  <dd className="text-[15px] text-ink-2"><CellView cell={cell} /></dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Numbered flow: a vertical chain on phones, wrapping boxes with arrows on wider screens. */
export function StepFlow({ b }: { b: Extract<GenVisual, { kind: "steps" }> }) {
  return (
    <div>
      <BlockTitle title={b.title} bn={b.title_bn} />
      <ol className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-y-3">
        {b.items.map((it, i) => (
          <li key={i} className="flex flex-col items-center sm:flex-row">
            <div className="w-full rounded-xl border-2 border-brand/25 bg-brand-soft px-3.5 py-3 sm:w-44 sm:self-stretch">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[13px] font-extrabold text-white">{i + 1}</span>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{it.text}</p>
              {b.labels_bn?.[i] && <p lang="bn" className="mt-1 text-[13.5px] text-ink-2">{b.labels_bn[i]}</p>}
              
            </div>
            {i < b.items.length - 1 && (
              <>
                <ArrowDown size={18} className="my-0.5 text-brand sm:hidden" aria-hidden />
                <ArrowRight size={18} className="mx-1 hidden shrink-0 text-brand sm:block" aria-hidden />
              </>
            )}
          </li>
        ))}
      </ol>
      {b.cycle && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[13px] font-semibold text-brand-ink ring-1 ring-line">
          <CornerDownLeft size={14} aria-hidden /> Step {b.items.length} leads back to step 1. It is a cycle. <span lang="bn">· আবার শুরু</span>
        </p>
      )}
    </div>
  );
}

export function CompareCard({ b }: { b: Extract<GenVisual, { kind: "compare" }> }) {
  const side = (s: typeof b.left, tone: string) => (
    <div className={`rounded-xl border-2 p-4 ${tone}`}>
      <p className="text-[16px] font-extrabold text-ink">{s.title}</p>
      {s.title_bn && <p lang="bn" className="text-[14px] text-ink-2">{s.title_bn}</p>}
      <ul className="mt-2.5 space-y-2">
        {s.points.map((p, i) => (
          <li key={i} className="flex gap-2 text-[15px] text-ink">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden />
            <span>{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div>
      <BlockTitle title={b.title} bn={b.title_bn} />
      <div className="relative grid gap-3 sm:grid-cols-2">
        {side(b.left, "border-brand/25 bg-brand-soft/60")}
        <span className="absolute left-1/2 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[12px] font-extrabold text-white sm:flex" aria-hidden>vs</span>
        {side(b.right, "border-sand-line bg-sand")}
      </div>
    </div>
  );
}

export function VisualBlock({ b }: { b: GenVisual }) {
  if (b.kind === "table") return <GuideTable b={b} />;
  if (b.kind === "steps") return <StepFlow b={b} />;
  return <CompareCard b={b} />;
}

function QaView({ b }: { b: Extract<GenGuideBlock, { kind: "qa" }> }) {
  const card = b.concept ? getIndexEntry(b.concept) : undefined;
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="bg-paper px-4 py-3">
        <p className="text-[17px] font-extrabold leading-snug text-ink">Q. {b.q}</p>
        <p lang="bn" className="mt-0.5 text-[14.5px] text-ink-2">বাংলা অর্থ: {b.q_bn}</p>
      </div>
      <div className="space-y-3 px-4 py-3.5">
        <div className="rounded-lg border-l-4 border-brand bg-brand-soft px-3.5 py-2.5">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-brand-ink">Answer · <span lang="bn" className="normal-case tracking-normal">উত্তর</span></p>
          <p className="mt-0.5 text-[16.5px] font-semibold text-ink">{b.answer.text}</p>
        </div>
        {b.example && (
          <p className="text-[15px] text-ink-2">
            <strong className="text-ink">Example:</strong> {b.example.en}
            {b.example.bn && <span lang="bn" className="mt-0.5 block text-[14.5px]">{b.example.bn}</span>}
          </p>
        )}
        {(b.tip || b.tip_bn) && (
          <p className="flex gap-2 rounded-lg bg-sand px-3 py-2 text-[14.5px] text-ink">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-hot" aria-hidden />
            <span><strong>Memory tip:</strong> {b.tip}{b.tip_bn && <span lang="bn" className="block text-ink-2">{b.tip_bn}</span>}</span>
          </p>
        )}
        {card && (
          <Link href={`/cbta/concept/${card.id}`} className="inline-flex min-h-9 items-center text-[13.5px] font-bold text-brand hover:underline">
            Full card: {card.title} →
          </Link>
        )}
      </div>
    </div>
  );
}

function FormView({ b }: { b: Extract<GenGuideBlock, { kind: "form" }> }) {
  return (
    <figure>
      <BlockTitle title={b.title} bn={b.title_bn} />
      <div className="rounded-xl border-2 border-dashed border-line-strong bg-card p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-3">
          <FileText size={15} aria-hidden /> Form from the CBLM · p.{b.cite.page}
        </p>
        {b.fields && (
          <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {b.fields.map((f) => (
              <div key={f} className="flex items-end gap-2 text-[14.5px]">
                <dt className="shrink-0 font-semibold text-ink">{f}</dt>
                <dd className="mb-1 flex-1 border-b border-dotted border-line-strong" aria-hidden />
              </div>
            ))}
          </dl>
        )}
        {b.columns && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-[14px]">
              <thead><tr>{b.columns.map((c) => <th key={c} scope="col" className="border border-line bg-paper px-2.5 py-2 text-left font-bold">{c}</th>)}</tr></thead>
              <tbody>
                {(b.rows?.length ? b.rows : [b.columns.map(() => "")]).map((r, i) => (
                  <tr key={i}>{b.columns!.map((_, j) => <td key={j} className="h-9 border border-line px-2.5 py-1.5 text-ink-2">{r[j] ?? ""}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {b.footer && (
          <ul className="mt-3 space-y-1 text-[14px] text-ink-2">
            {b.footer.map((f) => <li key={f} className="flex items-end gap-2"><span>{f}</span><span className="mb-1 flex-1 border-b border-dotted border-line-strong" aria-hidden /></li>)}
          </ul>
        )}
      </div>
      {b.note_bn && <figcaption lang="bn" className="mt-2 text-[14.5px] text-ink-2">{b.note_bn}</figcaption>}
    </figure>
  );
}

export function GuideBlockView({ b }: { b: GenGuideBlock }) {
  switch (b.kind) {
    case "table": case "steps": case "compare":
      return <VisualBlock b={b} />;
    case "qa":
      return <QaView b={b} />;
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <div>
          <BlockTitle title={`${b.title}${b.items.length > 2 ? ` (${b.items.length})` : ""}`} bn={b.title_bn} />
          <Tag className="space-y-2">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-3 text-[15.5px] text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">{b.ordered ? i + 1 : "✓"}</span>
                <span className="min-w-0">
                  <span className="block">{it.text}</span>
                  {b.items_bn?.[i] && <span lang="bn" className="mt-0.5 block text-[15px] text-hot">{b.items_bn[i]}</span>}
                </span>
              </li>
            ))}
          </Tag>
        </div>
      );
    }
    case "text":
      return (
        <div>
          <BlockTitle title={b.title} />
          {b.claims?.map((c, i) => <p key={i} className="mb-2 text-[16px] text-ink">{c.text}</p>)}
          {b.bn && (
            <ul className="mt-2 space-y-1.5 rounded-xl border border-sand-line bg-sand p-3.5">
              {b.bn.map((l, i) => <li key={i} lang="bn" className="text-[16px] text-ink">{l}</li>)}
            </ul>
          )}
        </div>
      );
    case "form":
      return <FormView b={b} />;
    case "note": {
      const caution = b.tone === "caution";
      const Icon = caution ? TriangleAlert : Lightbulb;
      return (
        <div className={`flex gap-3 rounded-xl p-3.5 ${caution ? "border border-danger-line bg-danger-soft" : "border border-sand-line bg-sand"}`}>
          <Icon size={18} className={`mt-0.5 shrink-0 ${caution ? "text-danger" : "text-hot"}`} aria-hidden />
          <div className="text-[15px] text-ink">
            {b.text && <p className="font-semibold">{b.text}</p>}
            {b.claims?.map((c, i) => <p key={i}>{c.text}</p>)}
            {b.bn && <p lang="bn" className="mt-1 text-ink-2">{b.bn}</p>}
          </div>
        </div>
      );
    }
  }
}
