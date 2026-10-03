import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 스냅 스크롤 스테이지와 현재 쇼츠 인덱스를 맞추고,
 * 이어 듣기 진입과 키보드 세로 이동을 담당한다.
 */
export function useShortScroller({
  count,
  resumeIndex,
  onMute,
}: {
  count: number;
  /** 세트 안에서 마지막 감상 지점 */
  resumeIndex: number;
  onMute: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  /* ---------- 1. 인덱스 동기화: 스크롤 위치 → 현재 쇼츠 ---------- */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollTop / el.clientHeight);
        if (i !== indexRef.current) setIndex(i);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* 진입 즉시 이어 듣기 위치로 (부트스트랩 뒤 첫 렌더에서 clientHeight가 있다) */
  useEffect(() => {
    if (resumeIndex < 0) return;
    const el = ref.current;
    if (!el) return;
    el.scrollTop = resumeIndex * el.clientHeight;
    setIndex(resumeIndex);
  }, [resumeIndex]);

  /* ---------- 2. 세로 세그먼트 바로가기 ---------- */
  const goTo = useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, i));
      el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(indexRef.current - 1);
      } else if (e.key === 'm') {
        onMute();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, onMute]);

  return { ref, index, indexRef, setIndex, goTo };
}
