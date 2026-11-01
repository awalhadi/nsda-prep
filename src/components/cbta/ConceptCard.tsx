// The concept card, always in the same 10-section order so learners learn the layout:
// title+stars+why · one-line answer · key words · Bangla · example · memory trick ·
// list answer · exam traps · practice · sources.

import type { ReactNode } from "react";
import type { GenCite, GenClaim, GenConcept } from "@/lib/cbta/types";
import { HighlightMark, Stars, StatusBadge } from "./Badges";

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6" aria-labelledby={`s${n}`}>
      <h2 id={`s${n}`} className="font-mono-tag text-xs uppercase tracking-wider text-text-faint mb-3">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function SourceChip({ cite }: { cite: GenCite }) {
  const where = cite.cblm ? `CBLM ${cite.cblm}` : cite.sourceTitle ?? cite.src;
  const page = cite.printedPage && cite.printedPage !== cite.page ? `p.${cite.printedPage} (PDF ${cite.page})` : `p.${cite.page}`;
  return (
    <details className="inline-block align-middle">
      <summary className="cursor-pointer list-none rounded-md border border-border-subtle bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted hover:border-teal/50">
        {where} {page}
      </summary>
      <blockquote className="mt-2 max-w-prose border-l-2 border-teal/50 pl-3 text-xs text-text-muted">
        “{cite.quote}”
        <span className="ml-1 text-text-faint">{cite.match === "exact" ? "· exact quote" : `· close match ${cite.match}`}</span>
      </blockquote>
    </details>
  );
}

function ClaimText({ claim }: { claim: GenClaim }) {
  return (
    <>
      <span>{claim.text}</span>{" "}
      <span className="inline-flex flex-wrap gap-1 align-middle">
        {claim.cites.slice(0, 2).map((c, i) => <SourceChip key={i} cite={c} />)}
      </span>
    </>
  );
}

function Bn({ children }: { children: ReactNode }) {
  return <span lang="bn" className="leading-[1.75]">{children}</span>;
}

export default function ConceptCard({ c }: { c: GenConcept }) {
  const { mcq, matching, short, viva } = c.practice;
  return (
    <article className="space-y-4 text-[17px] leading-relaxed">
      <Section n={1} title="Title">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <StatusBadge status={c.status} />
          {c.highlighted && <HighlightMark />}
          {c.sourceType === "question-paper-only" && (
            <span className="rounded-md border border-rose/50 px-1.5 py-0.5 text-[11px] text-rose">No CBLM: built from past questions</span>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          {c.title} <Stars n={c.stars} />
        </h1>
        <p className="mt-3 rounded-lg bg-amber/10 border border-amber/30 p-3 text-[15px]">
          <span className="font-semibold">কেন গুরুত্বপূর্ণ: </span>
          <Bn>{c.importance.bn}</Bn>
        </p>
      </Section>

      <Section n={2} title="One-line exam answer">
        <p className="text-lg font-semibold"><ClaimText claim={c.oneLineAnswer} /></p>
      </Section>

      <Section n={3} title="Key words">
        <ul className="grid gap-2 sm:grid-cols-2">
          {c.keywords.map((k) => (
            <li key={k.en} className="rounded-lg bg-surface-2 px-3 py-2">
              <strong>{k.en}</strong> = <Bn>{k.bn}</Bn>
            </li>
          ))}
        </ul>
      </Section>

      <Section n={4} title="বাংলায় বুঝি">
        <ul className="space-y-1.5 list-disc pl-5">
          {c.banglaExplanation.map((l, i) => <li key={i}><Bn>{l}</Bn></li>)}
        </ul>
      </Section>

      <Section n={5} title="Real-life example">
        <p>{c.example.en}</p>
        {c.example.bn && <p className="mt-2 text-text-muted"><Bn>{c.example.bn}</Bn></p>}
      </Section>

      {c.mnemonic && (
        <Section n={6} title="Memory trick">
          <p className="font-semibold text-teal">{c.mnemonic.text}</p>
          {c.mnemonic.explain_bn && <p className="mt-1 text-text-muted"><Bn>{c.mnemonic.explain_bn}</Bn></p>}
        </Section>
      )}

      {c.listAnswer && (
        <Section n={7} title={`List answer (${c.listAnswer.items.length} items)`}>
          <ol className="space-y-2 list-decimal pl-6">
            {c.listAnswer.items.map((it, i) => <li key={i}><ClaimText claim={it} /></li>)}
          </ol>
        </Section>
      )}

      <Section n={8} title="Exam traps">
        <ul className="space-y-2">
          {c.traps.map((t, i) => <li key={i} className="flex gap-2"><span aria-hidden>⚠️</span><span><ClaimText claim={t} /></span></li>)}
        </ul>
        {c.errata.map((e) => (
          <p key={e.id} className="mt-3 rounded-lg border border-rose/40 bg-rose/10 p-3 text-sm">
            <strong>CBLM correction:</strong> {e.issue} Write: {e.proposed}
          </p>
        ))}
      </Section>

      <Section n={9} title="Practice">
        <div className="space-y-5 text-[15px]">
          {c.realQuestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Real exam questions</h3>
              <ul className="space-y-3">
                {c.realQuestions.map((q) => (
                  <li key={q.id} className="rounded-lg bg-surface-2 p-3">
                    <p className="text-xs text-text-faint mb-1">{q.label}</p>
                    <p className="font-medium">{q.question}</p>
                    {q.options && (
                      <ol className="mt-1 list-[lower-alpha] pl-6 text-text-muted">
                        {q.options.map((o, i) => <li key={i}>{o}</li>)}
                      </ol>
                    )}
                    {q.answer && <p className="mt-2 whitespace-pre-line text-text-muted"><span className="text-text-faint">Answer key: </span>{q.answer}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Short question</h3>
            <p>{short.prompt}</p>
            <details className="mt-1"><summary className="cursor-pointer text-teal">Model answer</summary>
              <p className="mt-2 whitespace-pre-line">{short.modelAnswer}</p>
            </details>
          </div>
          <div>
            <h3 className="font-semibold">MCQ</h3>
            <p>{mcq.prompt}</p>
            <ol className="list-[lower-alpha] pl-6">
              {mcq.options.map((o, i) => <li key={i}>{o}</li>)}
            </ol>
            <details className="mt-1"><summary className="cursor-pointer text-teal">Answer</summary>
              <p className="mt-1">{String.fromCharCode(97 + mcq.answerIndex)}) {mcq.options[mcq.answerIndex]} <SourceChip cite={mcq.answerCite} /></p>
            </details>
          </div>
          <div>
            <h3 className="font-semibold">Matching</h3>
            <p>{matching.prompt}</p>
            <details className="mt-1"><summary className="cursor-pointer text-teal">Answers</summary>
              <ul className="mt-1 space-y-1">{matching.pairs.map((p) => <li key={p.left}><strong>{p.left}</strong> → {p.right}</li>)}</ul>
            </details>
          </div>
          <div>
            <h3 className="font-semibold">Viva <span className="text-xs font-normal text-text-faint">(derived: no viva samples in the papers)</span></h3>
            <p>{viva.prompt}</p>
            <details className="mt-1"><summary className="cursor-pointer text-teal">Say this</summary>
              <p className="mt-1"><ClaimText claim={viva.answer} /></p>
            </details>
          </div>
        </div>
      </Section>

      <Section n={10} title="Sources">
        <ul className="space-y-1 text-[15px]">
          {c.appearsIn.map((a) => (
            <li key={a.src}>CBLM {a.cblm}: pages {a.pages.map((p) => p.printed && p.printed !== p.pdf ? `${p.printed} (PDF ${p.pdf})` : p.pdf).join(", ")}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-text-faint">Priority score {c.score} = highlight {c.breakdown.highlight} + repeat {c.breakdown.repeat} + exam {c.breakdown.exam}</p>
      </Section>
    </article>
  );
}
