"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import ProgressRing from "@/components/ProgressRing";
import { getModuleMeta } from "@/data/loader";
import { moduleStats, getSettings } from "@/lib/storage";
import { Play, Layers, Clock, ArrowLeft, TrendingUp, History, Timer as TimerIcon } from "lucide-react";
import { notFound } from "next/navigation";

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const mod = getModuleMeta(id);
  const [stats, setStats] = useState<ReturnType<typeof moduleStats> | null>(null);
  const [count, setCount] = useState(15);
  const [timed, setTimed] = useState(true);
  const [secondsPerQ, setSecondsPerQ] = useState(30);

  useEffect(() => {
    const settings = getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setStats(moduleStats(id));
    setCount(settings.defaultCount);
    setTimed(settings.defaultTimed);
    setSecondsPerQ(settings.secondsPerQuestion);
  }, [id]);

  if (!mod) return notFound();

  const isFlash = mod.kind === "flashcards";
  const maxCount = mod.count;
  const presetCounts = [10, 15, 25, maxCount].filter((v, i, arr) => v <= maxCount && arr.indexOf(v) === i);

  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <Link href="/modules" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-teal font-mono-tag">
          <ArrowLeft size={13} /> back to modules
        </Link>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-mono-tag text-xs text-teal mb-1">module // {mod.id}</p>
            <h1 className="font-display font-bold text-2xl">{mod.title}</h1>
            <p className="text-text-muted text-sm mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Layers size={13} /> {mod.count} {isFlash ? "cards" : "questions"}</span>
              {stats && stats.attemptCount > 0 && (
                <span className="flex items-center gap-1"><History size={13} /> {stats.attemptCount} attempts</span>
              )}
            </p>
          </div>
          {stats && stats.accuracy !== null && (
            <ProgressRing value={stats.accuracy} size={90} stroke={8} color="auto" sublabel="best-known" />
          )}
        </div>

        {!isFlash ? (
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <TrendingUp size={16} className="text-teal" /> Start a quiz
            </h2>
            <div>
              <p className="text-xs text-text-faint mb-2 font-mono-tag">question count</p>
              <div className="flex flex-wrap gap-2">
                {presetCounts.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-mono-tag border transition-colors ${
                      count === c
                        ? "bg-teal text-[#052924] border-teal font-semibold"
                        : "border-border-subtle bg-surface-2 text-text-muted hover:border-teal/50"
                    }`}
                  >
                    {c === maxCount ? `all (${maxCount})` : c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-faint mb-2 font-mono-tag">mode</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimed(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    timed ? "bg-amber text-[#1a1200] border-amber font-semibold" : "border-border-subtle bg-surface-2 text-text-muted hover:border-amber/50"
                  }`}
                >
                  <Clock size={13} /> Timed ({secondsPerQ}s/Q)
                </button>
                <button
                  onClick={() => setTimed(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    !timed ? "bg-amber text-[#1a1200] border-amber font-semibold" : "border-border-subtle bg-surface-2 text-text-muted hover:border-amber/50"
                  }`}
                >
                  Untimed
                </button>
              </div>
            </div>
            {timed && (
              <div>
                <p className="text-xs text-text-faint mb-2 font-mono-tag flex items-center gap-1.5">
                  <TimerIcon size={13} /> seconds per question
                </p>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSecondsPerQ(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-mono-tag border transition-colors ${
                        secondsPerQ === s
                          ? "bg-teal text-[#052924] border-teal font-semibold"
                          : "border-border-subtle bg-surface-2 text-text-muted hover:border-teal/50"
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Link
              href={`/quiz/${mod.id}?count=${count}&timed=${timed ? 1 : 0}&spq=${secondsPerQ}`}
              className="inline-flex items-center gap-2 rounded-lg bg-teal text-[#052924] font-semibold text-sm px-5 py-2.5 hover:brightness-110 transition"
            >
              <Play size={14} fill="currentColor" /> Start quiz
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Layers size={16} className="text-teal" /> Flashcard drill
            </h2>
            <p className="text-sm text-text-muted">
              Flip each card, then rate yourself honestly. Cards marked &ldquo;still learning&rdquo; resurface at the end of the deck.
            </p>
            <Link
              href={`/flashcards/${mod.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-teal text-[#052924] font-semibold text-sm px-5 py-2.5 hover:brightness-110 transition"
            >
              <Play size={14} fill="currentColor" /> Start flashcards
            </Link>
          </div>
        )}

        {stats && stats.attempts.length > 0 && (
          <div className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="font-display font-semibold text-lg mb-3">Recent attempts</h2>
            <div className="space-y-2">
              {stats.attempts.slice(0, 6).map((a) => {
                const pct = Math.round((a.correct / a.total) * 100);
                const color = pct >= 80 ? "var(--accent-teal)" : pct >= 50 ? "var(--accent-amber)" : "var(--accent-rose)";
                return (
                  <div key={a.id} className="flex items-center justify-between text-sm border-b border-border-subtle/60 pb-2 last:border-0">
                    <span className="text-text-muted font-mono-tag text-xs">
                      {new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-mono-tag font-semibold" style={{ color }}>
                      {a.correct}/{a.total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
