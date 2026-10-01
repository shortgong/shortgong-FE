import { SHORTS } from '../data/content';
import './ChannelRail.css';

export type Channel = {
  name: string;
  tone: (typeof SHORTS)[number]['tone'];
  shorts: number;
  likes: number;
};

/** 쇼츠 데이터에서 실제 집계 — 새로 만들어내는 숫자는 없다 */
const CHANNELS: Channel[] = Object.values(
  SHORTS.reduce<Record<string, Channel>>((acc, s) => {
    const c = acc[s.channel] ?? { name: s.channel, tone: s.tone, shorts: 0, likes: 0 };
    c.shorts += 1;
    c.likes += s.likes;
    acc[s.channel] = c;
    return acc;
  }, {}),
);

export function ChannelRail({ onPick }: { onPick: (name: string) => void }) {
  return (
    <ul className="chrow">
      {CHANNELS.map((c) => (
        <li key={c.name}>
          <button type="button" className="chrow__item" onClick={() => onPick(c.name)}>
            <span className={`chrow__mark chrow__mark--${c.tone}`} aria-hidden="true">
              {c.name.slice(0, 1)}
            </span>
            <span className="chrow__name">{c.name}</span>
            <span className="chrow__count">{c.shorts}편</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
