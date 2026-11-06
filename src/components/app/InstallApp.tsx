"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Check, X, Share2 } from "lucide-react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(standalone.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    update();
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const used = () => setPrompt(null);
    window.addEventListener("nsda-install-prompt-used", used);
    const done = () => { setInstalled(true); setPrompt(null); dialog.current?.close(); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    standalone.addEventListener("change", update);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", done); window.removeEventListener("nsda-install-prompt-used", used); standalone.removeEventListener("change", update); };
  }, []);
  async function install() {
    if (!prompt) { dialog.current?.showModal(); return; }
    setBusy(true);
    window.dispatchEvent(new Event("nsda-install-prompt-used"));
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === "accepted" ? "ইনস্টল করার অনুরোধ গ্রহণ করা হয়েছে।" : "পরে আবার browser menu থেকে ইনস্টল করতে পারবেন।");
      setPrompt(null);
    } catch { setMessage("Browser menu থেকে Install app বা Add to Home Screen ব্যবহার করুন।"); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" onClick={install} disabled={installed || busy} className="install-button" aria-label={installed ? "অ্যাপ ইনস্টল করা আছে" : "অ্যাপ ইনস্টল করুন"}>
      {installed ? <Check size={17} aria-hidden /> : <Download size={17} aria-hidden />}<span lang="bn">{installed ? "ইনস্টল করা আছে" : busy ? "অপেক্ষা করুন…" : "অ্যাপ ইনস্টল"}</span>
    </button>
    {message && <p role="status" lang="bn" className="mt-2 text-sm text-ink-2">{message}</p>}
    <dialog ref={dialog} className="install-dialog" aria-labelledby="install-title">
      <div className="flex items-center justify-between gap-4"><h2 id="install-title" lang="bn" className="text-xl font-bold">ফোনে অ্যাপটি রাখুন</h2><button aria-label="নির্দেশনা বন্ধ করুন" onClick={() => dialog.current?.close()} className="icon-button"><X size={20} /></button></div>
      <p lang="bn" className="mt-3 text-ink-2">Browser-এর সুবিধা অনুযায়ী নিচের পদ্ধতিটি ব্যবহার করুন।</p>
      <div className="mt-5 space-y-5">
        <div><h3 className="font-bold">Android · Chrome / Edge</h3><p lang="bn" className="mt-1">Browser menu (⋮) → Install app অথবা Add to Home screen।</p></div>
        <div><h3 className="flex items-center gap-2 font-bold"><Share2 size={17} /> iPhone / iPad · Safari</h3><p lang="bn" className="mt-1">Share → Add to Home Screen → Add।</p></div>
        <p lang="bn" className="rounded-xl bg-brand-soft p-3 text-sm text-brand-ink">ইনস্টল করতে HTTPS বা localhost-এ অ্যাপটি খুলতে হবে। Offline পড়তে dashboard-এর download বাটন ব্যবহার করুন।</p>
      </div>
    </dialog>
  </>;
}
