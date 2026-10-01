import { useCallback, useState } from 'react';

/**
 * 쇼츠 임베드 상호작용 상태.
 *
 * iframe 은 터치를 소비하기 때문에, 마운트된 상태로는 세로 스와이프가 죽는다.
 * 그래서 첫 탭 전에는 iframe 을 아예 마운트하지 않는다:
 *   - 마운트 전  → 스와이프가 항상 통하고, 배경 그라디언트만 보인다
 *   - 탭         → iframe 마운트 + allow-autoplay 가 실제로 먹힌다
 *                  (브라우저 자동재생 정책상 문서 제스처가 선행돼야 한다)
 *   - 슬라이드 이동 → 호출측이 close() 한다. 다음 쇼츠는 항상 스와이프로 넘어가야 한다
 */
export function useEmbedInteraction() {
  const [liveId, setLiveId] = useState<string | null>(null);

  const open = useCallback((id: string) => setLiveId(id), []);
  const close = useCallback(() => setLiveId(null), []);
  const isLive = useCallback((id: string) => liveId === id, [liveId]);

  return { liveId, open, close, isLive };
}
