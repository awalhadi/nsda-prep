"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, RotateCcw, ClipboardCheck, Moon, Sun, Settings, Search, ArrowLeft, GraduationCap, WifiOff } from "lucide-react";
import InstallApp from "./InstallApp";
import SwRegistrar from "../cbta/SwRegistrar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cbta = pathname.startsWith("/cbta");
  const focus = pathname.startsWith("/quiz/") || pathname === "/cbta/mock";
  const [dark, setDark] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const load = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("nsda-theme"); } catch { /* system theme remains available */ }
      const value = saved ? saved === "dark" : media.matches;
      document.documentElement.dataset.theme = value ? "dark" : "light";
      setDark(value);
    };
    const network = () => setOffline(!navigator.onLine);
    load(); network();
    media.addEventListener("change", load);
    window.addEventListener("online", network); window.addEventListener("offline", network);
    return () => { media.removeEventListener("change", load); window.removeEventListener("online", network); window.removeEventListener("offline", network); };
  }, []);
  function toggleTheme() {
    const value = !dark;
    setDark(value); document.documentElement.dataset.theme = value ? "dark" : "light";
    try { localStorage.setItem("nsda-theme", value ? "dark" : "light"); } catch { /* session preference still applies */ }
  }
  const links = cbta ? [
    { href: "/cbta", label: "আজকের পড়া", icon: House, active: pathname === "/cbta" },
    { href: "/cbta/courses", label: "সব টপিক", icon: BookOpen, active: pathname === "/cbta/courses" || pathname === "/cbta/guide" || pathname.includes("/cblm/") || pathname.includes("/concept/") },
    { href: "/cbta/questions", label: "প্রশ্নচর্চা", icon: ClipboardCheck, active: pathname === "/cbta/questions" || pathname === "/cbta/mock" },
    { href: "/cbta/revise", label: "রিভিশন", icon: RotateCcw, active: pathname === "/cbta/revise" },
  ] : [
    { href: "/", label: "আজকের পড়া", icon: House, active: pathname === "/" },
    { href: "/modules", label: "সব মডিউল", icon: BookOpen, active: pathname === "/modules" || pathname.startsWith("/module/") },
    { href: "/modules#practice", label: "অনুশীলন", icon: ClipboardCheck, active: pathname.startsWith("/quiz/") || pathname.startsWith("/flashcards/") },
    { href: "/review", label: "রিভিশন", icon: RotateCcw, active: pathname === "/review" },
  ];
  return <div className={`app-shell ${focus ? "focus-mode" : ""}`}>
    <a href="#study-content" className="skip-link">মূল পড়ায় যান</a>
    {!focus && <aside className="app-sidebar">
      <Link href="/cbta" className="app-logo"><span className="brand-mark"><GraduationCap size={24} /></span><span>প্রস্তুতি<span className="block text-xs font-medium tracking-wide text-ink-3">NSDA STUDY COMPANION</span></span></Link>
      <p lang="bn" className="sidebar-label">আপনার কোর্স</p>
      <div className="course-switch"><Link href="/cbta" aria-current={cbta ? "page" : undefined} className={cbta ? "selected" : ""}>CBT&amp;A <span>Level 4</span></Link><Link href="/" aria-current={!cbta ? "page" : undefined} className={!cbta ? "selected" : ""}>Web Design <span>Level 3</span></Link></div>
      <p lang="bn" className="sidebar-label">পড়ার জায়গা</p>
      <nav aria-label="প্রধান নেভিগেশন" className="sidebar-nav">{links.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><Icon size={19} aria-hidden /><span lang="bn">{label}</span></Link>)}</nav>
      {cbta && <Link href="/cbta/mock" className="sidebar-exam"><ClipboardCheck size={20} /><span lang="bn">মডেল টেস্ট দিন<span className="block text-xs font-normal">MCQ · matching · short answer</span></span></Link>}
      <div className="sidebar-bottom"><p lang="bn" className="mb-3 text-sm text-ink-2">অল্প অল্প করে, নিয়মিত।<br />প্রতিদিনের অনুশীলনই এগিয়ে নেবে।</p><InstallApp /></div>
    </aside>}
    <div className="app-workspace">
      <header className="app-topbar">
        {focus ? <Link href={cbta ? "/cbta" : "/modules"} className="flex min-h-11 items-center gap-2 font-semibold"><ArrowLeft size={18} /><span lang="bn">পড়ায় ফিরুন</span></Link> : <>
          <Link href={cbta ? "/cbta" : "/"} className="flex items-center gap-2 font-bold"><span className="brand-mark small"><GraduationCap size={19} /></span><span className="hidden sm:inline" lang="bn">শিখি। মনে রাখি। এগিয়ে যাই।</span><span className="mobile-brand-name sm:hidden">প্রস্তুতি</span></Link>
          <div className="mobile-course-switch lg:hidden"><Link href={cbta ? "/" : "/cbta"}>{cbta ? "CBT&A · L4" : "Web Design · L3"}<span aria-hidden> ⇄</span></Link></div>
        </>}
        <div className="flex items-center gap-1 sm:gap-2">
          {offline && <span role="status" className="network-status"><WifiOff size={15} /><span className="hidden sm:inline">Offline</span></span>}
          {cbta && !focus && <Link href="/cbta/search" aria-label="টপিক খুঁজুন" className="icon-button"><Search size={19} /></Link>}
          <button onClick={toggleTheme} className="icon-button" aria-label={dark ? "হালকা থিম চালু করুন" : "ডার্ক থিম চালু করুন"}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
          {!focus && <Link href="/settings" className="icon-button" aria-label="সেটিংস"><Settings size={19} /></Link>}
        </div>
      </header>
      <div id="study-content" tabIndex={-1} className="study-content">{children}</div>
    </div>
    {!focus && <nav aria-label="মোবাইল নেভিগেশন" className="mobile-bottom-nav">{links.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><Icon size={21} aria-hidden /><span lang="bn">{label}</span></Link>)}</nav>}
    <SwRegistrar />
  </div>;
}
