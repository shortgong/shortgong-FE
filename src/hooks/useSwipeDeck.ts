import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

/** 어느 축으로 꺾였는지 판정하기 전의 무시 구간 */
const AXIS_LOCK = 6;
/** 화면폭 대비 이만큼 밀면 페이지 전환 */
const SWIPE_RATIO = 0.2;
/** px/ms 이상 빠르게 튕기면 짧게 밀어도 전환 */
const SWIPE_VELOCITY = 0.35;
/** 첫/마지막 카드에서 바깥으로 밀 때 저항 */
const EDGE_DAMP = 0.3;

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

  /** 끝을 넘겨서 dragging 하려는 구간은 거리에 비례해 덜 움직이게 한다 */
  const damp = (raw: number) => {
    const past = (index === 0 && raw > 0) || (index === last && raw < 0);
    return past ? raw * EDGE_DAMP : raw;
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
    setDx(damp(e.clientX - s.x));
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
    const raw = e.clientX - s.x;
    const velocity = raw / Math.max(1, e.timeStamp - s.t);
    const width = e.currentTarget.clientWidth || 1;
    if (Math.abs(raw) > width * SWIPE_RATIO || Math.abs(velocity) > SWIPE_VELOCITY) {
      go(index + (raw < 0 ? 1 : -1));
      return;
    }
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
