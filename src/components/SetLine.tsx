import { Icon } from './Icon';
import './SetLine.css';

type Props = {
  title: string;
  /** 표지 색조 — 단색 블록으로만 쓴다 */
  tone: 'mint' | 'sand' | 'lilac' | 'sky';
  /** 한 줄 요약 (Figma 의 '레슨 5 · 3분 분량' 자리) */
  meta: string;
  onClick: () => void;
  /** 홈 상단 대표 세트처럼 넓게 보여줄 때 */
  feature?: boolean;
};

export function SetLine({ title, tone, meta, onClick, feature }: Props) {
  return (
    <button
      type="button"
      className={`setline ${feature ? 'setline--feature' : ''}`}
      onClick={onClick}
      aria-label={`${title} — ${meta}`}
    >
      <span className={`setline__cover setline__cover--${tone}`} aria-hidden="true" />

      <span className="setline__body">
        <span className="setline__title">{title}</span>
        <span className="setline__meta">{meta}</span>
      </span>

      <span className="setline__go" aria-hidden="true">
        <Icon name="chevron" size={15} />
      </span>
    </button>
  );
}
