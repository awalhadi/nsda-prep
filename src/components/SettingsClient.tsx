"use client";

import { useEffect, useState } from "react";
import { Clock, Hash, Timer as TimerIcon } from "lucide-react";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type UserSettings } from "@/lib/storage";

const SECONDS_PRESETS = [15, 30, 45, 60, 90];
const COUNT_PRESETS = [10, 15, 25, 40];

export default function SettingsClient() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration on mount
    setSettings(getSettings());
    setReady(true);
  }, []);

  function update(patch: Partial<UserSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(patch);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <div className="h-40 rounded-xl border border-border-subtle bg-surface animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <p className="font-mono-tag text-xs text-teal mb-1">$ config --edit defaults</p>
        <h1 className="font-display font-bold text-2xl">Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Defaults applied whenever you start a new quiz. You can still override these per attempt.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-6 space-y-6">
        <div>
          <p className="text-xs text-text-faint mb-2 font-mono-tag flex items-center gap-1.5">
            <TimerIcon size={13} /> seconds per question
          </p>
          <div className="flex flex-wrap gap-2">
            {SECONDS_PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => update({ secondsPerQuestion: s })}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono-tag border transition-colors ${
                  settings.secondsPerQuestion === s
                    ? "bg-teal text-[#052924] border-teal font-semibold"
                    : "border-border-subtle bg-surface-2 text-text-muted hover:border-teal/50"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-text-faint mb-2 font-mono-tag flex items-center gap-1.5">
            <Clock size={13} /> default mode
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => update({ defaultTimed: true })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                settings.defaultTimed
                  ? "bg-amber text-[#1a1200] border-amber font-semibold"
                  : "border-border-subtle bg-surface-2 text-text-muted hover:border-amber/50"
              }`}
            >
              <Clock size={13} /> Timed
            </button>
            <button
              onClick={() => update({ defaultTimed: false })}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                !settings.defaultTimed
                  ? "bg-amber text-[#1a1200] border-amber font-semibold"
                  : "border-border-subtle bg-surface-2 text-text-muted hover:border-amber/50"
              }`}
            >
              Untimed
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-text-faint mb-2 font-mono-tag flex items-center gap-1.5">
            <Hash size={13} /> default question count
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNT_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => update({ defaultCount: c })}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono-tag border transition-colors ${
                  settings.defaultCount === c
                    ? "bg-teal text-[#052924] border-teal font-semibold"
                    : "border-border-subtle bg-surface-2 text-text-muted hover:border-teal/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
