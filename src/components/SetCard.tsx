import { Icon } from './Icon';
import './SetCard.css';

type Props = {
  title: string;
  desc: string;
  topic: string;
  level: string;
  /** 표지 색조 — 단색 블록으로만 쓴다 */
  tone: 'mint' | 'sand' | 'lilac' | 'sky';
  /** 한 줄 요약 (Figma 의 '레슨 5 · 3분 분량' 자리) */
  meta: string;
  onClick: () => void;
};

export function SetCard({ title, desc, topic, level, tone, meta, onClick }: Props) {
  return (
    <button type="button" className="setcard" onClick={onClick} aria-label={`${title} — ${meta}`}>
      <span className={`setcard__cover setcard__cover--${tone}`} aria-hidden="true" />

      <span className="setcard__body">
        <span className="setcard__tags">
          <span className="setcard__topic">{topic}</span>
          <span className="setcard__level">{level}</span>
        </span>

        <span className="setcard__title">{title}</span>
        <span className="setcard__desc">{desc}</span>

        <span className="setcard__foot">
          <span className="setcard__meta">{meta}</span>
          <span className="setcard__go" aria-hidden="true">
            <Icon name="chevron" size={16} />
          </span>
        </span>
      </span>
    </button>
  );
}
