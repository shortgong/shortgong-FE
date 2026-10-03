import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { describeError, useCreateVideo, useVideo } from '../api/queries';
import type { Video } from '../api/videos';

export type MakeStage = 'idle' | 'making' | 'done' | 'failed';

/** 폴링 상한과 간격은 useVideo 가 소유한다 (src/api/queries.ts) */
const POLL_MAX = 80;

export function useMakingProgress(opts: { onDone: (video: Video) => void; onError: (msg: string) => void }) {
  const { onDone, onError } = opts;
  const create = useCreateVideo();
  const [videoId, setVideoId] = useState<number | null>(null);

  /* 폴링·취소는 react-query 가 한다 — 언마운트하거나 videoId 를 null 로 돌리면 요청이 멈춘다 */
  const detail = useVideo(videoId);
  /* 완료·실패 알림은 한 번만. 상태 변경이 아니라 '결과가 났다'는 사실을 밖으로 알리는 일 */
  const notified = useRef(false);

  const done = detail.data?.status === 'COMPLETED';
  const timeout = videoId != null && !done && !create.isError && detail.pollCount >= POLL_MAX;
  const failed = create.isError || timeout || detail.data?.status === 'FAILED';

  /* pct 는 백엔드가 주지 않는다 — 조회가 늘 때마다 조금씩 오르는 건 연출일 뿐이라
     상태로 들고 가지 않고 그 자리에서 계산한다. 100 은 COMPLETED 일 때만. */
  const pct = done ? 100 : Math.min(99, (detail.pollCount + 1) * 7);

  const stage: MakeStage = failed
    ? 'failed'
    : done
      ? 'done'
      : create.isPending || videoId != null
        ? 'making'
        : 'idle';

  /* 실패 이유가 셋이다 — POST 자체가 실패 / 인제스트가 FAILED / 폴링 한도 초과.
     서버가 FAILED 를 준 경우에는 '네트워크 문제' 라고 말하면 엉뚱한 안내가 된다. */
  const reason: string =
    detail.data?.status === 'FAILED'
      ? '만들지 못했어요. 잠시 후 다시 시도해 주세요.'
      : timeout
        ? '시간이 오래 걸려요. 잠시 후 다시 시도해 주세요.'
        : create.isError && create.error instanceof ApiError && create.error.status === 401
          ? '로그인이 만료됐어요. 다시 로그인해 주세요.'
          : describeError(create.error);

  useEffect(() => {
    if (notified.current) return;
    if (done && detail.data) {
      notified.current = true;
      onDone(detail.data);
    } else if (failed) {
      notified.current = true;
      onError(reason);
    }
  }, [done, failed, reason, detail.data, onDone, onError]);

  const start = useCallback(
    (content: string) => {
      if (create.isPending || videoId != null) return;
      const text = content.trim();
      if (!text) return;

      notified.current = false;
      setVideoId(null);
      create.mutate(text, {
        onSuccess: (created) => {
          /* 곧바로 FAILED 로 주겨도 조회를 한 번 더 해서 사유를 본다 — 본문까지 들어있다 */
          setVideoId(created.id);
        },
      });
    },
    [create, videoId],
  );

  const reset = useCallback(() => {
    setVideoId(null);
    notified.current = false;
    create.reset();
  }, [create]);

  return { stage, pct, video: done ? (detail.data ?? null) : null, start, reset };
}