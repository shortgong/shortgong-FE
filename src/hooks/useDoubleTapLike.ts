import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/** 이 시간 안에 두 번 탭해야 더블탭으로 본다 */
export const DOUBLE_TAP_MS = 260;
/** 하트가 사라질 때까지 */
const BURST_MS = 620;

export type Burst = { x: number; y: number; key: number };

/**
 * 스테이지 더블탭 좋아요 + 하트 버스트.
 * pointer capture 를 걸면 click 이 스테이지로 리타겟돼서 레일 버튼이 눌리지 않으므로 잡지 않는다
 * (네이티브 스냅 스크롤이 그대로 동작).
 */
export function useDoubleTapLike({ getId, liked, onLike }: { getId: () => string; liked: () => boolean; onLike: (id: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  const burstSeq = useRef(0);
  const lastTap = useRef(0);

  const onPointerDown = () => setDragging(true);

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(false);
    const now = performance.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      const id = getId();
      if (!liked()) onLike(id);
      burstSeq.current += 1;
      const box = e.currentTarget.getBoundingClientRect();
      setBurst({ x: e.clientX - box.left, y: e.clientY - box.top, key: burstSeq.current });
      setTimeout(() => setBurst(null), BURST_MS);
    }
    lastTap.current = now;
  };

  return {
    dragging,
    burst,
    bind: { onPointerDown, onPointerUp, onPointerCancel: () => setDragging(false) },
  };
}
