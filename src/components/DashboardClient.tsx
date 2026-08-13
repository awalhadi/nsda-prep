"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Zap, Target, AlertTriangle, ArrowRight, Play, Lightbulb } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import ModuleCard from "@/components/ModuleCard";
import { MODULES } from "@/data/loader";
import { overallStats, moduleStats, level } from "@/lib/storage";

export default function DashboardClient() {
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof overallStats> | null>(null);
  const [modAcc, setModAcc] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const s = overallStats();
    const acc: Record<string, number | null> = {};
    MODULES.forEach((m) => {
      acc[m.id] = moduleStats(m.id).accuracy;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setStats(s);
    setModAcc(acc);
    setReady(true);
  }, []);

  if (!ready || !stats) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="h-40 rounded-xl border border-border-subtle bg-surface animate-pulse" />
      </div>
    );
  }

  const lvl = level(stats.xp);
  const weakModules = MODULES.filter((m) => m.kind === "mcq" && modAcc[m.id] !== null && (modAcc[m.id] as number) < 60)
    .sort((a, b) => (modAcc[a.id] as number) - (modAcc[b.id] as number))
    .slice(0, 3);

  const suggestionModules = MODULES.filter((m) => m.id.startsWith("new-suggestion-"));
  const mcqModules = MODULES.filter((m) => m.kind === "mcq" && !m.id.startsWith("new-suggestion-"));
  const flashModules = MODULES.filter((m) => m.kind === "flashcards" && !m.id.startsWith("new-suggestion-"));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-amber/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="font-mono-tag text-xs text-teal mb-2">$ status --check readiness</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
              Your NSDA Web Design L-3 readiness
            </h1>
            <p className="text-text-muted text-sm mt-2">
              {stats.attemptCount === 0
                ? "No attempts logged yet. Start a quiz below to establish your baseline accuracy."
                : `You've answered ${stats.totalQ} questions across ${stats.attemptCount} sessions with ${stats.accuracy}% overall accuracy.`}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                href={weakModules[0] ? `/module/${weakModules[0].id}` : "/modules"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber text-[#1a1200] font-semibold text-sm px-4 py-2 hover:brightness-110 transition"
              >
                <Play size={14} fill="currentColor" /> Continue practicing
              </Link>
              <Link
                href="/review"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-2 text-sm px-4 py-2 hover:border-teal/60 transition"
              >
                Review mistakes <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <ProgressRing value={stats.accuracy} sublabel="accuracy" color="auto" />
            <div className="flex flex-col gap-3">
              <StatChip icon={Flame} value={stats.streak.current} label="day streak" color="var(--accent-rose)" />
              <StatChip icon={Zap} value={`Lv.${lvl.lvl}`} label={`${lvl.into}/${lvl.need} xp`} color="var(--accent-amber)" />
              <StatChip icon={AlertTriangle} value={stats.mistakeCount} label="to review" color="var(--accent-violet)" />
            </div>
          </div>
        </div>
      </section>

      {/* Weak spots */}
      {weakModules.length > 0 && (
        <section>
          <SectionHeading title="Focus here next" subtitle="Modules under 60% accuracy" />
          <div className="grid sm:grid-cols-3 gap-3">
            {weakModules.map((m) => (
              <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id]} />
            ))}
          </div>
        </section>
      )}

      {/* MCQ modules */}
      <section>
        <SectionHeading title="Practice sets" subtitle="Timed multiple-choice drills, instant feedback" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mcqModules.map((m) => (
            <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id]} />
          ))}
        </div>
      </section>

      {/* Flashcards */}
      <section>
        <SectionHeading title="Flashcards" subtitle="Short-answer recall — flip, self-rate, repeat" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {flashModules.map((m) => (
            <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id]} />
          ))}
        </div>
      </section>

      {/* New Suggestion */}
      {suggestionModules.length > 0 && (
        <section>
          <SectionHeading
            title="New Suggestion"
            subtitle="Latest suggestion sheets, turned into practice"
            icon={Lightbulb}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestionModules.map((m) => (
              <ModuleCard key={m.id} mod={m} accuracy={modAcc[m.id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon = Target,
}: {
  title: string;
  subtitle: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="font-display font-semibold text-lg flex items-center gap-2">
        <Icon size={16} className="text-teal" /> {title}
      </h2>
      <span className="text-xs text-text-faint font-mono-tag">{subtitle}</span>
    </div>
  );
}

function StatChip({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 py-1.5">
      <Icon size={14} style={{ color }} />
      <div className="leading-tight">
        <div className="font-mono-tag text-sm font-semibold tabular-nums">{value}</div>
        <div className="text-[10px] text-text-faint">{label}</div>
      </div>
    </div>
  );
}
