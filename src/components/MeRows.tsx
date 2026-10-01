import { useState } from 'react';
import { Icon, type IconName } from './Icon';

export type MeRow = { icon: IconName; label: string; hint?: string; panel: string };

/** 아코디언 행. 열면 패널 문구를 보여준다 */
export function MeRows({ rows, onOpen }: { rows: readonly MeRow[]; onOpen?: (label: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="rows">
      {rows.map((r) => (
        <li key={r.label}>
          <button
            type="button"
            className="row"
            aria-expanded={open === r.label}
            onClick={() => {
              setOpen(open === r.label ? null : r.label);
              onOpen?.(r.label);
            }}
          >
            <span className="row__icon">
              <Icon name={r.icon} size={20} />
            </span>
            <span className="row__label t-body">{r.label}</span>
            {r.hint && <span className="row__hint t-caption-plain">{r.hint}</span>}
            <span className={`row__chev ${open === r.label ? 'is-open' : ''}`} aria-hidden="true">
              <Icon name="chevron" size={16} />
            </span>
          </button>
          {open === r.label && <div className="row__panel t-body muted">{r.panel}</div>}
        </li>
      ))}
    </ul>
  );
}
