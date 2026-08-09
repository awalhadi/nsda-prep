"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, LayoutDashboard, BookOpen, RotateCcw } from "lucide-react";

const links = [
  { href: "/", label: "dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "modules", icon: BookOpen },
  { href: "/review", label: "review", icon: RotateCcw },
];

export default function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 border border-border-subtle text-amber group-hover:border-amber transition-colors">
            <Terminal size={15} strokeWidth={2.4} />
          </span>
          <span className="font-display font-semibold tracking-tight text-[15px]">
            console<span className="text-teal">.</span>
            <span className="text-text-muted font-mono-tag text-xs font-normal">webdesign-l3</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-2 text-text-primary border border-border-subtle"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2/60"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline font-mono-tag text-xs">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
