/** Small static progress ring (no client JS). */
export default function Ring({ value, size = 76, label }: { value: number; size?: number; label?: string }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}%${label ? ` ${label}` : ""}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-brand)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[17px] font-extrabold leading-none text-ink">{Math.round(pct)}%</span>
        {label && <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink-3">{label}</span>}
      </div>
    </div>
  );
}
