import { SHORTS, fmtCount, fmtSec } from '../data/content';
import type { Short } from '../data/content';
import './ShortRail.css';

const TOP_N = 6;

/** 좋아요 순 — 목데이터이므로 정렬만 하고 숫자를 새로 만들지 않는다 */
const picks = [...SHORTS].sort((a, b) => b.likes - a.likes).slice(0, TOP_N);

export function ShortRail({ onPick }: { onPick: (id: string) => void }) {
  return (
    <ul className="hrail" tabIndex={0} aria-label="인기 쇼츠 가로 스크롤">
      {picks.map((s) => (
        <li key={s.id} className="hrail__item">
          <ShortCard short={s} onClick={() => onPick(s.id)} />
        </li>
      ))}
    </ul>
  );
}

function ShortCard({ short, onClick }: { short: Short; onClick: () => void }) {
  return (
    <button
      type="button"
      className="shortcard"
      onClick={onClick}
      aria-label={`${short.title} · ${short.channel} · ${short.tag} · ${fmtSec(short.seconds)}`}
    >
      <span className={`shortcard__thumb shortcard__thumb--${short.tone}`}>
        <span className="shortcard__topic">{short.topic}</span>
        <span className="shortcard__len">{fmtSec(short.seconds)}</span>
      </span>

      <span className="shortcard__title">{short.title}</span>

      <span className="shortcard__foot">
        <span className="shortcard__channel">{short.channel}</span>
        <span className="shortcard__likes">{fmtCount(short.likes)}</span>
      </span>
    </button>
  );
}
