// The concept card. Sections always come in the same order, each with its own
// colour and icon, so learners learn the layout once and find things fast.

import type { ReactNode } from "react";
import {
  AlertTriangle, BookMarked, Brain, ClipboardList, Factory, Flame, GraduationCap, Languages,
  ListOrdered, MessageCircle, PenLine, Sparkles,
} from "lucide-react";
import type { GenClaim, GenConcept } from "@/lib/cbta/types";
import { HighlightMark, PRIORITY, PriorityPill, StatusBadge } from "./Badges";
import SourceChip from "./SourceChip";
import PracticeTabs from "./PracticeTabs";

type Tone = "teal" | "violet" | "amber" | "sky" | "fuchsia" | "emerald" | "rose" | "indigo";

const TONE: Record<Tone, { icon: string; border: string; glow: string }> = {
  teal: { icon: "bg-teal/15 text-teal", border: "border-teal/25", glow: "from-teal/10" },
  violet: { icon: "bg-violet/15 text-violet", border: "border-violet/25", glow: "from-violet/10" },
  amber: { icon: "bg-amber/15 text-amber", border: "border-amber/25", glow: "from-amber/10" },
  sky: { icon: "bg-sky-400/15 text-sky-300", border: "border-sky-400/25", glow: "from-sky-400/10" },
  fuchsia: { icon: "bg-fuchsia-400/15 text-fuchsia-300", border: "border-fuchsia-400/25", glow: "from-fuchsia-400/10" },
  emerald: { icon: "bg-emerald-400/15 text-emerald-300", border: "border-emerald-400/25", glow: "from-emerald-400/10" },
  rose: { icon: "bg-rose-400/15 text-rose-300", border: "border-rose-400/25", glow: "from-rose-400/10" },
  indigo: { icon: "bg-indigo-400/15 text-indigo-300", border: "border-indigo-400/25", glow: "from-indigo-400/10" },
};

function Section({ id, tone, Icon, title, titleBn, children }: {
  id: string; tone: Tone; Icon: typeof PenLine; title: string; titleBn?: string; children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`scroll-mt-anchor relative overflow-hidden rounded-3xl border ${t.border} bg-surface/80 p-5 sm:p-7`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${t.glow} to-transparent`} />
      <h2 id={`${id}-h`} className="relative mb-4 flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${t.icon}`}><Icon size={20} aria-hidden /></span>
        <span>
          <span className="block font-display text-lg font-semibold leading-tight">{title}</span>
          {titleBn && <span lang="bn" className="block text-sm text-text-faint">{titleBn}</span>}
        </span>
      </h2>
      <div className="relative">{children}</div>
    </section>
  );
}

function Cites({ claim, max = 1 }: { claim: GenClaim; max?: number }) {
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
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
  ["trick", "Trick"], ["list", "List"], ["traps", "Traps"], ["practice", "Practice"], ["sources", "Sources"],
] as const;

export default function ConceptCard({ c }: { c: GenConcept }) {
  const p = PRIORITY[c.stars];
  const letters = c.mnemonic ? mnemonicLetters(c.mnemonic.text) : null;
  const tiles = letters && c.listAnswer && letters.length === c.listAnswer.items.length
    ? letters.map((l, i) => ({ l, word: splitHead(c.listAnswer!.items[i].text)[0] }))
    : null;
  const mnemonicPhrase = c.mnemonic?.text.split("→")[0].trim().replace(/^"|"$/g, "");
  const present = new Set(["answer", "words", "bangla", "example", "traps", "practice", "sources",
    ...(c.mnemonic ? ["trick"] : []), ...(c.listAnswer ? ["list"] : [])]);
  const typesLabel = c.likelyTypes.map((t) => (t === "mcq" ? "MCQ" : t === "short" ? "Short" : "Matching")).join(" · ");

  return (
    <article className="space-y-5 text-[16px] leading-relaxed sm:text-[17px]">
      {/* ---------- 1. Hero ---------- */}
      <header className={`relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br ${p.ring} to-surface p-6 sm:p-8`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-2">
          <PriorityPill n={c.stars} />
          {c.highlighted && <HighlightMark />}
          <StatusBadge status={c.status} />
        </div>
        <h1 className="relative mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{c.title}</h1>
        <p className="relative mt-1 text-sm text-text-muted">CBLM {c.cblmPrimary}{c.aliases.length ? ` · also called ${c.aliases.join(", ")}` : ""}</p>

        <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber">
            <Flame size={14} aria-hidden /> কেন গুরুত্বপূর্ণ
          </p>
          <p lang="bn" className="text-[15px] text-text-primary">{c.importance.bn}</p>
        </div>

        <dl className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/5 px-2 py-2.5">
            <dt className="text-[11px] text-text-faint">Asked</dt>
            <dd className="font-display text-xl font-bold">{c.realQuestions.length}×</dd>
          </div>
          <div className="rounded-xl bg-white/5 px-2 py-2.5">
            <dt className="text-[11px] text-text-faint">Comes as</dt>
            <dd className="text-sm font-semibold leading-7">{typesLabel || "—"}</dd>
          </div>
          <div className="rounded-xl bg-white/5 px-2 py-2.5">
            <dt className="text-[11px] text-text-faint">Priority</dt>
            <dd className={`font-display text-xl font-bold ${p.text}`}>{"★".repeat(c.stars)}</dd>
          </div>
        </dl>
      </header>

      {/* Quick-jump bar */}
      <nav aria-label="On this card" className="cbta-noscrollbar sticky top-14 z-30 -mx-4 overflow-x-auto bg-canvas/85 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-2xl sm:px-2">
        <ul className="flex gap-1.5">
          {NAV.filter(([id]) => present.has(id)).map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} lang={id === "bangla" ? "bn" : undefined} className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-text-muted hover:border-teal/50 hover:text-teal">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- 2. Exam answer ---------- */}
      <Section id="answer" tone="teal" Icon={PenLine} title="Write this in the exam" titleBn="পরীক্ষায় এভাবে লিখুন">
        <blockquote className="rounded-2xl border-l-4 border-teal bg-teal/10 p-4 sm:p-5">
          <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{c.oneLineAnswer.text}</p>
          <div className="mt-3"><Cites claim={c.oneLineAnswer} max={2} /></div>
        </blockquote>
      </Section>

      {/* ---------- 3. Key words ---------- */}
      <Section id="words" tone="violet" Icon={Languages} title="Key words" titleBn="মূল শব্দ ও অর্থ">
        <ul className="grid grid-cols-2 gap-2.5">
          {c.keywords.map((k) => (
            <li key={k.en} className="rounded-2xl border border-violet/20 bg-violet/7 px-4 py-3">
              <p className="font-display text-[17px] font-bold text-violet">{k.en}</p>
              <p lang="bn" className="text-[15px] text-text-muted">{k.bn}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- 4. Bangla ---------- */}
      <Section id="bangla" tone="amber" Icon={MessageCircle} title="বাংলায় বুঝি" titleBn="সহজ ভাষায় ব্যাখ্যা">
        <ol className="space-y-3">
          {c.banglaExplanation.map((l, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/20 text-sm font-bold text-amber">{i + 1}</span>
              <p lang="bn" className="text-[17px] text-text-primary">{l}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------- 5. Example ---------- */}
      <Section id="example" tone="sky" Icon={Factory} title="Real-life example" titleBn="বাস্তব উদাহরণ">
        <div className="rounded-2xl bg-sky-400/7 p-4 sm:p-5">
          <p className="text-[17px]">{c.example.en}</p>
          {c.example.bn && <p lang="bn" className="mt-3 border-t border-sky-400/20 pt-3 text-[15px] text-text-muted">{c.example.bn}</p>}
        </div>
      </Section>

      {/* ---------- 6. Memory trick ---------- */}
      {c.mnemonic && (
        <Section id="trick" tone="fuchsia" Icon={Brain} title="Memory trick" titleBn="মনে রাখার কৌশল">
          {tiles ? (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
              {tiles.map((t, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/10 px-1 py-3 text-center">
                  <span className="font-display text-2xl font-bold text-fuchsia-300 sm:text-3xl">{t.l}</span>
                  <span className="mt-1 line-clamp-2 text-[10px] leading-tight text-text-muted">{t.word}</span>
                </div>
              ))}
            </div>
          ) : null}
          <p className={`${tiles ? "mt-4" : ""} font-display text-lg font-semibold text-fuchsia-200`}>{mnemonicPhrase}</p>
          {c.mnemonic.explain_bn && <p lang="bn" className="mt-1 text-[15px] text-text-muted">{c.mnemonic.explain_bn}</p>}
        </Section>
      )}

      {/* ---------- 7. List answer ---------- */}
      {c.listAnswer && (
        <Section id="list" tone="emerald" Icon={ListOrdered} title={`Remember all ${c.listAnswer.items.length}`} titleBn="তালিকা: পুরোটা মনে রাখুন">
          <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-emerald-400/25">
            {c.listAnswer.items.map((it, i) => {
              const [head, rest] = splitHead(it.text);
              return (
                <li key={i} className="relative flex gap-3">
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-display text-sm font-bold text-emerald-950">{i + 1}</span>
                  <div className="flex-1 rounded-2xl bg-white/3 px-4 py-2.5">
                    <p className="font-semibold text-emerald-100">{head}</p>
                    {rest && <p className="text-[15px] text-text-muted">{rest}</p>}
                    <div className="mt-1"><Cites claim={it} /></div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* ---------- 8. Traps ---------- */}
      <Section id="traps" tone="rose" Icon={AlertTriangle} title="Exam traps" titleBn="যেখানে ভুল হয়">
        <ul className="space-y-2.5">
          {c.traps.map((t, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/8 p-4">
              <AlertTriangle size={18} className="mt-1 shrink-0 text-rose-300" aria-hidden />
              <p className="text-[15px]">{t.text}<Cites claim={t} /></p>
            </li>
          ))}
          {c.errata.map((e) => (
            <li key={e.id} className="rounded-2xl border border-amber/30 bg-amber/10 p-4 text-[15px]">
              <strong className="text-amber">CBLM correction:</strong> {e.issue} <strong>Write:</strong> {e.proposed}
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- 9. Practice ---------- */}
      <Section id="practice" tone="indigo" Icon={GraduationCap} title="Practice" titleBn="নিজেকে যাচাই করুন">
        <PracticeTabs practice={c.practice} />
        {c.realQuestions.length > 0 && (
          <details className="group mt-6 rounded-2xl border border-white/10 bg-black/20">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold">
              <ClipboardList size={16} className="text-indigo-300" aria-hidden />
              Real exam questions ({c.realQuestions.length})
              <span className="ml-auto text-xs text-text-faint group-open:hidden">Show</span>
            </summary>
            <ul className="space-y-3 px-4 pb-4">
              {c.realQuestions.map((q) => (
                <li key={q.id} className="rounded-xl bg-white/3 p-3">
                  <span className="mb-1 inline-block rounded-full bg-indigo-400/15 px-2 py-0.5 text-[11px] font-medium text-indigo-200">{q.label}</span>
                  <p className="font-medium">{q.question}</p>
                  {q.options && (
                    <ol className="mt-1 list-[upper-alpha] pl-6 text-sm text-text-muted">
                      {q.options.map((o, i) => <li key={i} className={q.answerIndex === i ? "text-emerald-300" : ""}>{o}</li>)}
                    </ol>
                  )}
                  {q.answer && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-teal">Answer from the paper / answer key</summary>
                      <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{q.answer}</p>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      {/* ---------- 10. Sources ---------- */}
      <Section id="sources" tone="teal" Icon={BookMarked} title="Sources" titleBn="কোথা থেকে নেওয়া">
        <ul className="flex flex-wrap gap-2">
          {c.appearsIn.flatMap((a) => a.pages.map((pg) => (
            <li key={`${a.src}-${pg.pdf}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-muted">
              CBLM {a.cblm} · p.{pg.printed ?? pg.pdf}
            </li>
          )))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-faint">
          <Sparkles size={12} aria-hidden /> Every fact on this card links to the exact words in the CBLM. Tap a source tag to read them.
        </p>
      </Section>
    </article>
  );
}
