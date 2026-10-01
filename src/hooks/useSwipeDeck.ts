import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

/** 어느 축으로 꺾였는지 판정하기 전의 무시 구간 */
const AXIS_LOCK = 6;

type Axis = null | 'x' | 'y';

type Options = {
  /** 카드 수 */
  count: number;
  /** 현재 인덱스 */
  index: number;
  /** 인덱스 변경 통지 */
  onIndex: (next: number) => void;
  /** false 면 제스처를 무시한다 (버튼 처리 중 등) */
  enabled?: boolean;
};

/**
 * 가로 카드 덱 제스처.
 * 세로 스크롤은 브라우저에 맡기고, 축이 확정된 뒤에만 가로 이동을 가로챈다.
 */
export function useSwipeDeck({ count, index, onIndex, enabled = true }: Options) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const g = useRef<{ on: boolean; axis: Axis; x: number; y: number; t: number }>({
    on: false,
    axis: null,
    x: 0,
    y: 0,
    t: 0,
  });

  const last = count - 1;

  const go = (next: number) => {
    onIndex(Math.min(last, Math.max(0, next)));
    setDx(0);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    g.current = { on: true, axis: null, x: e.clientX, y: e.clientY, t: e.timeStamp };
    setDragging(true);
    setDx(0);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = g.current;
    if (!s.on) return;
    if (s.axis === null) {
      const mx = e.clientX - s.x;
      const my = e.clientY - s.y;
      if (Math.abs(mx) < AXIS_LOCK && Math.abs(my) < AXIS_LOCK) return;
      s.axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
      if (s.axis === 'x') e.currentTarget.setPointerCapture(e.pointerId);
      else setDragging(false);
    }
    if (s.axis !== 'x') return;
    setDx(e.clientX - s.x);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = g.current;
    if (!s.on) return;
    g.current.on = false;
    // 놓는 즉시 트랜지션을 되살려야 제자리로 부드럽게 붙는다
    setDragging(false);
    if (s.axis !== 'x') {
      setDx(0);
      return;
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    go(index);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(last);
    else return;
    e.preventDefault();
  };

  return {
    dx,
    dragging,
    go,
    onKeyDown,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
