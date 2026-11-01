// The concept card. Same section order on every card so learners learn the layout once.
// Colour carries meaning only: green = what to write, red = traps, sand = Bangla help,
// yellow = highlighted in the CBLM. Everything else is calm black-on-white.

import type { ReactNode } from "react";
import { AlertTriangle, BookMarked, Brain, Factory, GraduationCap, Languages, ListOrdered, MessageCircle, PenLine } from "lucide-react";
import type { GenClaim, GenConcept } from "@/lib/cbta/types";
import { HighlightMark, PRIORITY, PriorityPill, StatusBadge } from "./Badges";
import SourceChip from "./SourceChip";
import PracticeTabs from "./PracticeTabs";

function Section({ id, Icon, title, titleBn, children }: {
  id: string; Icon: typeof PenLine; title: string; titleBn?: string; children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-anchor rounded-2xl border border-line bg-card p-5 sm:p-7">
      <h2 id={`${id}-h`} className="mb-4 flex items-center gap-2.5">
        <Icon size={18} className="text-ink-3" aria-hidden />
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-3">{title}</span>
        {titleBn && <span lang="bn" className="text-[13px] text-ink-3/80">· {titleBn}</span>}
      </h2>
      {children}
    </section>
  );
}

function Cites({ claim, max = 1 }: { claim: GenClaim; max?: number }) {
  return (
    <span className="ml-1 inline-flex flex-wrap gap-x-1">
      {claim.cites.slice(0, max).map((c, i) => <SourceChip key={i} cite={c} />)}
    </span>
  );
}

/** "Head: description" → ["Head", "description"] */
function splitHead(text: string): [string, string] {
  const i = text.indexOf(":");
  return i > 0 && i < 60 ? [text.slice(0, i), text.slice(i + 1).trim()] : [text, ""];
}

/** Letters of a mnemonic like "… → E-S-I-E-A-P (top to bottom)". */
function mnemonicLetters(text: string): string[] | null {
  const m = /→\s*([A-Z](?:\s*-\s*[A-Z])+)/.exec(text);
  return m ? m[1].split("-").map((s) => s.trim()) : null;
}

const NAV = [
  ["answer", "Answer"], ["words", "Key words"], ["bangla", "বাংলা"], ["example", "Example"],
  ["trick", "Memory trick"], ["list", "List"], ["traps", "Traps"], ["practice", "Practice"], ["sources", "Sources"],
] as const;

export default function ConceptCard({ c }: { c: GenConcept }) {
  const p = PRIORITY[c.stars];
  const letters = c.mnemonic ? mnemonicLetters(c.mnemonic.text) : null;
  const tiles = letters && c.listAnswer && letters.length === c.listAnswer.items.length
    ? letters.map((l, i) => ({ l, word: splitHead(c.listAnswer!.items[i].text)[0].split(/[\s(]/)[0] }))
    : null;
  const mnemonicPhrase = c.mnemonic?.text.split("→")[0].trim().replace(/^"|"$/g, "");
  const present = new Set(["answer", "words", "bangla", "example", "traps", "practice", "sources",
    ...(c.mnemonic ? ["trick"] : []), ...(c.listAnswer ? ["list"] : [])]);
  const typesLabel = c.likelyTypes.map((t) => (t === "mcq" ? "MCQ" : t === "short" ? "Short" : "Matching")).join(", ");

  return (
    <article className="space-y-4 text-[16px] leading-relaxed text-ink sm:text-[17px]">
      {/* ---------- Title ---------- */}
      <header className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityPill n={c.stars} />
          {c.highlighted && <HighlightMark />}
          <StatusBadge status={c.status} />
        </div>
        <h1 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[36px]">{c.title}</h1>
        <p className="mt-1 text-sm text-ink-3">CBLM {c.cblmPrimary}{c.aliases.length ? ` · also called ${c.aliases.join(", ")}` : ""}</p>

        <div className="mt-5 flex gap-3 rounded-xl bg-paper p-4">
          <span className={`w-1 shrink-0 rounded-full ${p.rail}`} aria-hidden />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Why it matters · <span lang="bn" className="normal-case tracking-normal">কেন গুরুত্বপূর্ণ</span></p>
            <p lang="bn" className="mt-1 text-[15.5px] text-ink-2">{c.importance.bn}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
          <div className="px-2 py-3">
            <dd className="text-xl font-extrabold">{c.realQuestions.length}×</dd>
            <dt className="text-[12px] text-ink-3">asked before</dt>
          </div>
          <div className="px-2 py-3">
            <dd className="text-[15px] font-bold leading-7">{typesLabel || "—"}</dd>
            <dt className="text-[12px] text-ink-3">comes as</dt>
          </div>
          <div className="px-2 py-3">
            <dd className={`text-xl font-extrabold ${p.text}`}>{"★".repeat(c.stars)}<span className="text-line-strong">{"★".repeat(3 - c.stars)}</span></dd>
            <dt className="text-[12px] text-ink-3">priority</dt>
          </div>
        </dl>
      </header>

      {/* Jump bar */}
      <nav aria-label="On this card" className="cbta-noscrollbar sticky top-14 z-30 -mx-4 overflow-x-auto border-b border-line bg-paper/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-2">
        <ul className="flex gap-1">
          {NAV.filter(([id]) => present.has(id)).map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} lang={id === "bangla" ? "bn" : undefined}
                className="inline-flex min-h-9 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold text-ink-2 hover:bg-card hover:text-brand">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- Exam answer ---------- */}
      <section id="answer" aria-labelledby="answer-h" className="scroll-mt-anchor rounded-2xl border-2 border-brand/30 bg-brand-soft p-5 sm:p-7">
        <h2 id="answer-h" className="mb-3 flex flex-wrap items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-ink">
          <PenLine size={18} aria-hidden /> Write this in the exam <span lang="bn" className="normal-case tracking-normal opacity-80">· পরীক্ষায় এভাবে লিখুন</span>
        </h2>
        <p className="text-[21px] font-bold leading-snug text-ink sm:text-[24px]">{c.oneLineAnswer.text}</p>
        <div className="mt-2"><Cites claim={c.oneLineAnswer} max={2} /></div>
      </section>

      {/* ---------- Key words ---------- */}
      <Section id="words" Icon={Languages} title="Key words" titleBn="মূল শব্দ">
        <dl className="divide-y divide-line">
          {c.keywords.map((k) => (
            <div key={k.en} className="grid grid-cols-[minmax(7rem,38%)_1fr] gap-3 py-2.5 first:pt-0 last:pb-0">
              <dt className="font-bold text-ink">{k.en}</dt>
              <dd lang="bn" className="text-ink-2">{k.bn}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------- Bangla ---------- */}
      <section id="bangla" aria-labelledby="bangla-h" className="scroll-mt-anchor rounded-2xl border border-sand-line bg-sand p-5 sm:p-7">
        <h2 id="bangla-h" className="mb-3 flex items-center gap-2.5 text-[#8a5a00]">
          <MessageCircle size={18} aria-hidden /> <span lang="bn" className="text-[16px] font-bold">বাংলায় বুঝি</span>
        </h2>
        <ul className="space-y-2.5">
          {c.banglaExplanation.map((l, i) => (
            <li key={i} lang="bn" className="flex gap-3 text-[17.5px] text-ink">
              <span className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c98a1a]" aria-hidden />
              {l}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Example ---------- */}
      <Section id="example" Icon={Factory} title="Real-life example" titleBn="বাস্তব উদাহরণ">
        <p className="text-[17px] text-ink">{c.example.en}</p>
        {c.example.bn && <p lang="bn" className="mt-3 border-t border-line pt-3 text-[15.5px] text-ink-2">{c.example.bn}</p>}
      </Section>

      {/* ---------- Memory trick ---------- */}
      {c.mnemonic && (
        <Section id="trick" Icon={Brain} title="Memory trick" titleBn="মনে রাখার কৌশল">
          {tiles && (
            <div className="mb-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
              {tiles.map((t, i) => (
                <div key={i} className="flex flex-col items-center rounded-xl border border-line bg-paper px-1 pb-2 pt-2.5 text-center">
                  <span className="text-2xl font-extrabold text-brand sm:text-3xl">{t.l}</span>
                  <span className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-tight text-ink-3">{t.word}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-lg font-bold text-ink">{mnemonicPhrase}</p>
          {c.mnemonic.explain_bn && <p lang="bn" className="mt-1 text-[15.5px] text-ink-2">{c.mnemonic.explain_bn}</p>}
        </Section>
      )}

      {/* ---------- List ---------- */}
      {c.listAnswer && (
        <Section id="list" Icon={ListOrdered} title={`Remember all ${c.listAnswer.items.length}`} titleBn="পুরো তালিকা">
          <ol className="space-y-3">
            {c.listAnswer.items.map((it, i) => {
              const [head, rest] = splitHead(it.text);
              return (
                <li key={i} className="flex gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <div className="min-w-0 flex-1 border-b border-line pb-3">
                    <span className="font-bold text-ink">{head}</span>
                    {rest && <span className="text-ink-2"> · {rest}</span>}
                    <Cites claim={it} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* ---------- Traps ---------- */}
      <section id="traps" aria-labelledby="traps-h" className="scroll-mt-anchor rounded-2xl border border-danger-line bg-danger-soft p-5 sm:p-7">
        <h2 id="traps-h" className="mb-4 flex flex-wrap items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-danger">
          <AlertTriangle size={18} aria-hidden /> Exam traps <span lang="bn" className="normal-case tracking-normal opacity-80">· যেখানে ভুল হয়</span>
        </h2>
        <ul className="space-y-3">
          {c.traps.map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white" aria-hidden>!</span>
              <div className="text-[16px] text-ink">{t.text}<Cites claim={t} /></div>
            </li>
          ))}
          {c.errata.map((e) => (
            <li key={e.id} className="rounded-xl bg-card p-3 text-[15px] ring-1 ring-danger-line">
              <strong className="text-danger">CBLM correction:</strong> {e.issue} <strong>Write:</strong> {e.proposed}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Practice ---------- */}
      <Section id="practice" Icon={GraduationCap} title="Practice" titleBn="নিজেকে যাচাই করুন">
        <PracticeTabs practice={c.practice} />
        {c.realQuestions.length > 0 && (
          <details className="group mt-6 rounded-xl border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-[15px] font-bold">
              Real exam questions ({c.realQuestions.length})
              <span className="ml-auto text-xs font-semibold text-brand group-open:hidden">Show</span>
            </summary>
            <ul className="divide-y divide-line border-t border-line">
              {c.realQuestions.map((q) => (
                <li key={q.id} className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-ink-3">{q.label}</span>
                  <p className="font-semibold">{q.question}</p>
                  {q.options && (
                    <ol className="mt-1 list-[upper-alpha] pl-6 text-[15px] text-ink-2">
                      {q.options.map((o, i) => <li key={i} className={q.answerIndex === i ? "font-semibold text-ok" : ""}>{o}</li>)}
                    </ol>
                  )}
                  {q.answer && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[13px] font-semibold text-brand">Answer from the paper / answer key</summary>
                      <p className="mt-1 whitespace-pre-line text-[15px] text-ink-2">{q.answer}</p>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      {/* ---------- Sources ---------- */}
      <Section id="sources" Icon={BookMarked} title="Sources" titleBn="কোথা থেকে নেওয়া">
        <p className="text-[15px] text-ink-2">
          {c.appearsIn.map((a) => `CBLM ${a.cblm}, pages ${a.pages.map((pg) => pg.printed ?? pg.pdf).join(", ")}`).join(" · ")}
        </p>
        <p className="mt-2 text-[13px] text-ink-3">Every fact links to the exact words in the CBLM. Tap an underlined page reference to read them.</p>
      </Section>
    </article>
  );
}
