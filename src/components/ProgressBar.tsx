import type { ReactNode } from 'react';
import './ProgressBar.css';

type Props = {
  value: number;
  max?: number;
  height?: number;
  tone?: 'brand' | 'neutral';
  label?: string;
  className?: string;
};

export function ProgressBar({ value, max = 100, height = 8, tone = 'neutral', label, className = '' }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={`progress progress--${tone} ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

type DotsProps = {
  total: number;
  active: number;
  filled?: number;
  label?: string;
};

export function DotProgress({ total, active, filled = 0, label }: DotsProps) {
  const items: ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    items.push(
      <span
        key={i}
        className={`dotbar__dot ${i < filled ? 'is-seen' : ''} ${i === active ? 'is-active' : ''}`}
        aria-hidden="true"
      />,
    );
  }
  return (
    <div className="dotbar" role="group" aria-label={label}>
      {items}
    </div>
  );
}
