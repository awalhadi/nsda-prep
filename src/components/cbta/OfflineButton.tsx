"use client";

import { useEffect, useState } from "react";
import { CloudDownload, CheckCircle2 } from "lucide-react";

type State = { kind: "idle" } | { kind: "busy"; done: number; total: number } | { kind: "done"; pages: number } | { kind: "error"; message: string } | { kind: "unsupported" };

const SAVED_KEY = "cbta_offline_version";

export default function OfflineButton({ version }: { version: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection on mount
      setState({ kind: "unsupported" });
      return;
    }
    try { if (localStorage.getItem(SAVED_KEY) === version) setState({ kind: "done", pages: 0 }); } catch { /* storage blocked */ }
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d?.type === "precache-progress") setState({ kind: "busy", done: d.done, total: d.total });
      if (d?.type === "precache-done") {
        setState({ kind: "done", pages: d.pages });
        try { localStorage.setItem(SAVED_KEY, version); } catch { /* storage blocked */ }
      }
      if (d?.type === "precache-error") setState({ kind: "error", message: d.message });
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, [version]);

  const start = async () => {
    setState({ kind: "busy", done: 0, total: 1 });
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sw = reg.active ?? (await navigator.serviceWorker.ready).active;
      sw?.postMessage({ type: "precache" });
    } catch (e) {
      setState({ kind: "error", message: String(e) });
    }
  };

  if (state.kind === "unsupported") return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="font-bold">ইন্টারনেট ছাড়াও পড়ুন</p>
        <p lang="bn" className="text-[14px] text-ink-3">দুই কোর্সের পড়া একবার ডাউনলোড করুন। জায়গা ও সময় লাগতে পারে; শেষে সফলভাবে সংরক্ষণের বার্তা দেখুন।</p>
        {state.kind === "busy" && <p role="status" className="mt-1 text-[13px] font-semibold text-brand">Downloading… {state.done} / {state.total}</p>}
        {state.kind === "error" && <p role="alert" className="mt-1 text-[13px] text-danger">Download failed. Please try again with internet.</p>}
      </div>
      {state.kind === "done" ? (
        <span role="status" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ok"><CheckCircle2 size={18} aria-hidden /> Saved for offline</span>
      ) : (
        <button type="button" onClick={start} disabled={state.kind === "busy"}
          className="cbta-btn inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-brand border-b-brand-ink bg-brand px-4 text-[14px] font-bold text-white disabled:opacity-70">
          <CloudDownload size={17} aria-hidden /> {state.kind === "busy" ? "Downloading…" : "Download for offline use"}
        </button>
      )}
    </div>
  );
}
