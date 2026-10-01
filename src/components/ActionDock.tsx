import type { ReactNode } from 'react';
import './ActionDock.css';

type Props = {
  children: ReactNode;
  /** 하단 그라디언트 + safe area 적용 */
  elevated?: boolean;
  /** 탭바가 없는 화면에서 아래 여백을 얼마나 줄일지 */
  compact?: boolean;
};

/**
 * 하단 탭바가 없는 화면(생성 · 테스트 · 결과)의 하단 CTA 영역.
 * 콘텐츠가 스크롤되더라도 항상 손 닿는 위치에 두는 고정 액션 바.
 */
export function ActionDock({ children, elevated = true, compact = false }: Props) {
  return (
    <div className={`dock ${elevated ? 'dock--elevated' : ''} ${compact ? 'dock--compact' : ''}`}>
      <div className="dock__inner">{children}</div>
    </div>
  );
}
