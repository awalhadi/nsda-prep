"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export default function ProgressRing({
  value,
  size = 140,
  stroke = 10,
  label,
  sublabel,
  color = "var(--accent-teal)",
}: ProgressRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;
  const ringColor =
    value >= 80 ? "var(--accent-teal)" : value >= 50 ? "var(--accent-amber)" : "var(--accent-rose)";

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color === "auto" ? ringColor : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-tag font-semibold text-2xl tabular-nums" style={{ color: "var(--text-primary)" }}>
          {label ?? `${Math.round(animated)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] uppercase tracking-wider text-text-faint mt-1">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
