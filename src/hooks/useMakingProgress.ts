import { useEffect, useRef, useState } from 'react';

export type MakeStage = 'idle' | 'making' | 'done';

const TICK_MS = 90;
const FAST_BELOW = 70;

/**
 * 쇼츠 생성 진행률.
 * 진행률은 ref 로 추적한다 — state 업데이터 안에서 setStage/toast 를 부르면
 * "다른 컴포넌트를 렌더링하는 중 StoreProvider 를 업데이트" 오류가 난다.
 */
export function useMakingProgress(onDone: () => void) {
  const [stage, setStage] = useState<MakeStage>('idle');
  const [pct, setPct] = useState(0);
  const pctRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const start = () => {
    if (stage !== 'idle') return;
    setStage('making');
    pctRef.current = 0;
    setPct(0);
    timerRef.current = setInterval(() => {
      const next = pctRef.current + (pctRef.current < FAST_BELOW ? 7 : 4);
      if (next >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        pctRef.current = 100;
        setPct(100);
        setStage('done');
        onDone();
        return;
      }
      pctRef.current = next;
      setPct(next);
    }, TICK_MS);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    pctRef.current = 0;
    setPct(0);
    setStage('idle');
  };

  return { stage, pct, start, reset };
}
