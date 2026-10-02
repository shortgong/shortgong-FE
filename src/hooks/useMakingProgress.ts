import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { createVideo, fetchVideo } from '../api/videos';
import type { Video } from '../api/videos';

export type MakeStage = 'idle' | 'making' | 'done' | 'failed';

const POLL_MS = 1500;
const POLL_MAX = 80;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 쇼츠 생성 진행.
 *
 * 예전엔 타이머로 100% 까지 올리는 흉내였지만, 백엔드가 이미 상태를 알려주므로
 * 진짜 통신으로 바꾼다: POST /api/video → PROCESSING 이면 GET 을 끝까지 따라간다.
 *
 * pct 는 백엔드가 주지 않는다(done/failed 는 반드시 응답 기준). 화면용 수치가 필요하니
 * 조회 한 번마다 조금씩 올리는 건 연출이고, 성공·실패 판정은 절대 통신 결과만 따른다.
 */
export function useMakingProgress(opts: { onDone: (video: Video) => void; onError: (msg: string) => void }) {
  const { onDone, onError } = opts;
  const [stage, setStage] = useState<MakeStage>('idle');
  const [pct, setPct] = useState(0);
  const [video, setVideo] = useState<Video | null>(null);
  const pctRef = useRef(0);
  /* false 가 되면 진행 중인 대기와 응답이 모두 무시된다 — 취소·내려감의 유일한 통로 */
  const liveRef = useRef(true);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
    };
  }, []);

  const bump = useCallback((value: number) => {
    /* 99% 에서 멈춘다 — 100 은 응답이 확정한 뒤에만 찍는다 */
    const next = Math.min(99, Math.max(pctRef.current + 7, value));
    pctRef.current = next;
    setPct(next);
  }, []);

  const fail = useCallback(
    (message: string) => {
      if (!liveRef.current) return;
      setStage('failed');
      onError(message);
    },
    [onError],
  );

  const settle = useCallback(
    (result: Video) => {
      if (!liveRef.current) return;
      pctRef.current = 100;
      setPct(100);
      setVideo(result);
      setStage('done');
      onDone(result);
    },
    [onDone],
  );

  /**
   * PROCESSING 인 동안 끝까지 따라간다.
   * 재귀 대신 반복문 — 취소는 liveRef 하나로 처리한다.
   */
  const watch = useCallback(
    async (id: number) => {
      for (let tries = 0; tries < POLL_MAX; tries++) {
        await sleep(POLL_MS);
        if (!liveRef.current) return;
        try {
          const result = await fetchVideo(id);
          if (!liveRef.current) return;
          if (result.status === 'FAILED') return fail('만들지 못했어요. 잠시 후 다시 시도해 주세요.');
          if (result.status === 'COMPLETED') return settle(result);
          bump(0);
        } catch (e) {
          /* 세션이 끊겼다면 재시도해도 소용없다 */
          if (e instanceof ApiError && e.status === 401) {
            return fail('로그인이 만료됐어요. 다시 로그인해 주세요.');
          }
          /* 그 밖 오류(일시적인 네트워크 등)는 다음 회차에 다시 물어본다 */
        }
      }
      fail('시간이 오래 걸려요. 잠시 후 다시 시도해 주세요.');
    },
    [bump, fail, settle],
  );

  const start = useCallback(
    (content: string) => {
      if (stage !== 'idle') return;
      const text = content.trim();
      if (!text) return;

      liveRef.current = true;
      setStage('making');
      pctRef.current = 0;
      setPct(0);
      setVideo(null);

      createVideo(text)
        .then((created) => {
          if (!liveRef.current) return;
          if (created.status === 'FAILED') return fail('만들지 못했어요. 잠시 후 다시 시도해 주세요.');
          if (created.status === 'COMPLETED') {
            /* 이미 완성돼 있으면 한 번만 조회해서 본문을 받는다 */
            return fetchVideo(created.id).then(settle).catch(() => fail('결과를 불러오지 못했어요.'));
          }
          bump(12);
          void watch(created.id);
        })
        .catch((e: unknown) => {
          if (e instanceof ApiError && e.status === 401) return fail('로그인이 필요해요. 먼저 로그인해 주세요.');
          fail(e instanceof ApiError ? e.message : '네트워크를 확인해 주세요.');
        });
    },
    [bump, fail, settle, stage, watch],
  );

  /* 대기가 도는 중에 초기화되면 진행 중인 응답이 나중에 되살아나면 안 된다 */
  const reset = useCallback(() => {
    liveRef.current = false;
    pctRef.current = 0;
    setPct(0);
    setVideo(null);
    setStage('idle');
  }, []);

  return { stage, pct, video, start, reset };
}