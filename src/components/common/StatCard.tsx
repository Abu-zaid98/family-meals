import type { ReactNode } from 'react';

interface Props {
  value: ReactNode;
  label: string;
  sub: string;
}

export function StatCard({ value, label, sub }: Props) {
  return (
    <div className="rounded-[1.6rem] border border-white/14 bg-white/10 p-5 shadow-[0_20px_50px_rgba(10,20,30,0.18)] backdrop-blur-xl transition-all hover:scale-[1.02]">
      <p className="text-xs font-bold tracking-wide text-white/65 uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-display text-5xl font-bold text-white tracking-tight">
        {value}
      </p>
      <p className="mt-3 text-[11px] leading-relaxed text-white/70">
        {sub}
      </p>
    </div>
  );
}
