import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, fetchMe, getAccessToken, logout as logoutReq, setAccessToken } from './client';
import {
  createVideo,
  discoverVideos,
  fetchVideo,
  forgetScannedIds,
  pickRandom,
  readScannedIds,
  toShort,
  writeScannedIds,
} from './videos';
import { qk, queryClient } from './queryClient';

const FIVE_MIN = 5 * 60_000;
const POLL_MS = 1500;
/** 인제스트가 오래 걸려도 무한 폴링은 하지 않는다 — 여기서 끊고 화면이 실패를 보여준다 */
const POLL_MAX = 80;
/** 목록 API 가 없을 때 훑을 아이디 범위 */
const DEFAULT_SCAN_IDS = Array.from({ length: 15 }, (_, i) => i + 1);

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
      /* 내가 만든 영상이면 목록 탐색 대상에 바로 넣는다 — 다음 훑기까지 기다리지 않는다 */
      const known = readScannedIds();
      if (known) writeScannedIds([...known, created.id]);
    },
  });
}

/**
 * 백엔드에 실제로 존재하는 쇼츠를 찾아 하나를 랜덤으로 고른다.
 *
 * 목록 API 가 없으므로 1~15 를 병렬로 훑고, 존재하면서 인제스트가 끝난 것만 남긴다.
 * 랜덤 고르는 일도 여기서 끝낸다 — queryFn 이 캐시 키의 안쪽에서 한 번만 돌기 때문에
 * 리렌더마다 다른 쇼츠가 나오지 않는다. 다시 뽑으려면 invalidateQueries({queryKey: qk.feed}).
 */
export function useRandomServerShort(ids?: number[]) {
  return useQuery({
    queryKey: qk.feed,
    queryFn: async () => {
      /* 기억에 있는 id 가 있으면 그것만 묻는다. 단 '없다'는 걸로 기억하면(빈 배열)
         영상을 하나도 못 찾은 상태와 아직 훑지 않은 상태를 구분할 수 없다 —
         그래서 빈 배열이면 다시 훑는다. */
      const known = ids ?? readScannedIds();
      const target = known && known.length > 0 ? known : DEFAULT_SCAN_IDS;
      const videos = await discoverVideos(target);
      /* 실제로 응답한 것만 남긴다 — 없어진 id 는 여기서 떨어진다 */
      writeScannedIds(videos.map((v) => v.id));
      return { videos, picked: pickRandom(videos) };
    },
    enabled: !!getAccessToken(),
    /* 목록은 한 번 훑으면 오래 된다 — invalidate 로만 갱신한다 */
    staleTime: FIVE_MIN,
    retry: 0,
  });
}

/** 서버에 새로 생긴 영상이 반영될 때 — 기억을 지우고 다시 훑는다 */
export function useRescanFeed() {
  const client = useQueryClient();
  return useCallback(() => {
    forgetScannedIds();
    client.invalidateQueries({ queryKey: qk.feed });
  }, [client]);
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