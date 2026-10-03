import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, fetchMe, getAccessToken, logout as logoutReq, setAccessToken } from './client';
import { createVideo, fetchVideo, pickRandomVideoId, toShort } from './videos';
import { qk, queryClient } from './queryClient';

const FIVE_MIN = 5 * 60_000;
const POLL_MS = 1500;
/** 인제스트가 오래 걸려도 무한 폴링은 하지 않는다 — 여기서 끊고 화면이 실패를 보여준다 */
const POLL_MAX = 80;

/**
 * 내 정보.
 *
 * 토큰이 없으면 아예 묻지 않는다 — 익명 손님에게 401 을 찍어 보내는 Request 는 없다.
 * accessToken 이 localStorage 에 남으므로 새로고침 후에도 로그인이 유지된다.
 * 401 이면 client.ts 의 refresh 가 한 번 끼어들고, 그래도 실패하면 토큰이 지워져
 * 여기서도 'anon' 으로 떨어진다.
 */
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: fetchMe,
    enabled: !!getAccessToken(),
    staleTime: FIVE_MIN,
    retry: 1,
  });
}

/** 로그인 직후 — 회원을 캐시에 바로 채워 넣으면 useMe 가 기다리지 않고 바로 authed 가 된다 */
export function primeMe() {
  return queryClient.fetchQuery({ queryKey: qk.me, queryFn: fetchMe, staleTime: FIVE_MIN });
}

/**
 * 쇼츠 원본.
 *
 * PROCESSING 인 동안만 폴링하고, COMPLETED/FAILED 가 오면 멈춘다.
 * refetchInterval 을 함수로 주면 "언제까지" 를 상태로 판단하므로 화면 상태와 어긋나지 않는다.
 * 완성본은 캐시에 남으므로 다시 열면 통신 없이 바로 그린다.
 */
export function useVideo(id: number | null) {
  /* 조회 횟수 — 폴링 상한과 진행률 연출이 함께 본다 (공개 타입에 카운터가 없어 직접 센다) */
  const [polls, setPolls] = useState(0);
  const [lastId, setLastId] = useState(id);
  /* 다른 쇼츠로 넘어가면 카운터를 0에서 다시 시작한다 (props 가 바뀌면 상태를 맞추는 React 권장 패턴) */
  if (lastId !== id) {
    setLastId(id);
    setPolls(0);
  }

  const query = useQuery({
    queryKey: qk.video(id ?? 0),
    queryFn: async () => {
      const v = await fetchVideo(id!);
      setPolls((n) => n + 1);
      return v;
    },
    enabled: id != null,
    /* 처리 중에는 절대 캐시를 믿으면 안 된다 — 그래야 끝난 판정을 즉시 받는다 */
    staleTime: (q) => (q.state.data?.status === 'COMPLETED' ? FIVE_MIN : 0),
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data || data.status !== 'PROCESSING') return false;
      return polls >= POLL_MAX ? false : POLL_MS;
    },
  });

  return { ...query, pollCount: polls };
}

/** 서버 영상을 피드 항목으로 바꾼다 — 캐시는 원본 Video 로 두고, 화면에서만 변환한다 */
export function useVideoShort(id: number | null) {
  return useQuery({
    queryKey: qk.video(id ?? 0),
    queryFn: () => fetchVideo(id!),
    enabled: id != null,
    staleTime: (q) => (q.state.data?.status === 'COMPLETED' ? FIVE_MIN : 0),
    select: toShort,
  });
}

export function useCreateVideo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createVideo,
    onSuccess: (created) => {
      /* 곧바로 완성본이 오는 경우도 있으므로 캐시를 미리 심는다 */
      client.setQueryData(qk.video(created.id), created);
    },
  });
}

/**
 * 존재하는 쇼츠 중 하나를 랜덤으로 골라 한 번만 조회한다.
 *
 * 목록 API 가 없어 아이디를 알고 있어야 한다 — 지금은 1, 2, 9, 14 가 확정이라
 * videos.KNOWN_VIDEO_IDS 에 있다. 1~15 를 훑던 것은 과했다(없는 id 마다 404 가 났다).
 * 고르는 일도 여기서 끝낸다 — queryFn 이 캐시 키 안쪽에서 한 번만 돌기 때문에
 * 리렌더마다 다른 쇼츠가 나오지 않는다. 다시 뽑으려면 invalidateQueries({queryKey: qk.feed}).
 */
export function useRandomServerShort() {
  return useQuery({
    queryKey: qk.feed,
    queryFn: () => fetchVideo(pickRandomVideoId()),
    enabled: !!getAccessToken(),
    staleTime: FIVE_MIN,
    retry: 0,
  });
}

/**
 * 로그아웃.
 *
 * 서버 세션(쿠키)과 로컬 토큰을 정리하고, 캐시까지 통째로 비운다.
 * 비우지 않으면 다음 사람이 로그인했을 때 직전 사용자 정보가 캐시에서 잠깐 보인다.
 */
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logoutReq,
    onSettled: () => {
      setAccessToken(null);
      client.clear();
    },
  });
}


/** ApiError 를 화면 문장으로 바꾼다 — 401 은 "세션이 죽었다"로 구분한다 */
export function describeError(e: unknown, anonMessage = '로그인이 필요해요. 먼저 로그인해 주세요.') {
  if (e instanceof ApiError) {
    if (e.status === 401) return anonMessage;
    return e.message;
  }
  return '네트워크를 확인해 주세요.';
}