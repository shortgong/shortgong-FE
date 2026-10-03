import { QueryClient } from '@tanstack/react-query';

/**
 * 캐시 전략 — 기본값과 예외를 한 곳에 모아 둔다.
 *
 * 기본
 *   · staleTime 1분 — 화면을 왔다 갔다 할 때 같은 요청을 반복하지 않는다
 *   · gcTime 5분   — 캐시를 5분간 유지한다. Watch→홈→Watch 로 돌아올 때 캐시에서 즉시 렌더되고,
 *                    그 사이에 언마운트돼도 진행 중이던 refetch 가 끊기지 않는다
 *   · retry 1      — GET 은 한 번만. 세 번씩 반복하면 백엔드가 죽어도 화면은 계속 기다린다
 *   · focus 재조회 끔 — 이 앱은 폴링이 이미 있으므로 포커스마다 붙는 요청은 노이즈다
 *
 * 예외는 각 쿼리에서 정한다 (src/api/queries.ts)
 *   · 회원 정보는 5분 — 자주 안 바뀐다
 *   · 완성된 쇼츠는 사실상 불변 — staleTime 을 크게 두어 Watch 재방문이 캐시 히트로 끝난다
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    /* 중복 제출은 되돌릴 수 없다 — 자동 재시도 금지 */
    mutations: { retry: 0 },
  },
});

/** 쿼리 키를 한 곳에 모은다 — 무효화할 때 문자열을 헷갈리지 않게 */
export const qk = {
  me: ['auth', 'me'] as const,
  video: (id: number) => ['video', id] as const,
};