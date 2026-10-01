import { useEffect, useState } from 'react';

const TYPING_MS = 22;

/** 첫 질문 프롬프트를 채팅처럼 한 글자씩 찍는다. 0번 턴에서만 실행된다. */
export function useTypewriter(prompt: string | undefined, active: boolean) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!active || !prompt) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) clearInterval(t);
    }, TYPING_MS);
    return () => clearInterval(t);
  }, [active, prompt]);

  return typed;
}
