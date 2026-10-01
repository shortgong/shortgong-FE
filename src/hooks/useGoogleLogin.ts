import { useEffect, useRef, useState } from 'react';

const STEP_LABELS = ['계정 확인 중', '기록 불러오는 중', '로그인 중'];

export const LOGIN_STEP_LABELS = STEP_LABELS;

/**
 * 목업 Google 로그인 흐름.
 * 실제 OAuth 연동 시 `finish` 콜백만 Google Identity Services로 바꾸면 된다.
 */
export function useGoogleLogin(finish: () => void) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const login = () => {
    if (!agreed || loading) return;
    setLoading(true);
    setStep(0);
    setTick(0);

    timers.current.push(
      window.setInterval(() => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1)), 430),
      window.setInterval(() => setTick((t) => t + 1), 520),
      window.setTimeout(() => {
        timers.current.forEach(clearInterval);
        timers.current = [];
        finish();
      }, 1500),
    );
  };

  return { agreed, setAgreed, loading, step, tick, login };
}
