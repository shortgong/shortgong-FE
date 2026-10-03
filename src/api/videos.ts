import { apiFetch } from './client';
import type { Short } from '../data/content';

/** 인제스트 상태 — PROCESSING 동안은 완성된 HTML 이 아직 없다 */
export type VideoStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type Video = {
  id: number;
  title: string;
  /** 사용자가 넣은 원문 */
  content: string;
  status: VideoStatus;
  /**
   * 인제스트가 만든 self-contained HTML.
   * 여기가 ShortEmbed 의 srcDoc 으로 들어가므로, 없는 동안은 아무것도 렌더링하지 않는다.
   */
  draft: string;
  likeCount: number;
  viewCount: number;
  author: { id: number; username: string } | null;
};

export type Created = { id: number; status: VideoStatus };

/** 쇼츠 생성 — 백엔드가 인제스트를 걸어두므로 곧바로 완성본이 오지 않는다 */
export function createVideo(content: string) {
  return apiFetch<Created>('/api/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export function fetchVideo(id: number) {
  return apiFetch<Video>(`/api/video/${id}`);
}

/**
 * 목록 엔드포인트가 없으므로 아이디를 훑어 본다.
 *
 * 없는 아이디는 404 로 돌아오는데, 하나가 404 난다고 전체를 실패시키면 안 된다 —
 * 15개를 병렬로 던지고 '존재하면서 인제스트가 끝난 것'만 남긴다.
 */
export async function discoverVideos(ids: number[]): Promise<Video[]> {
  const settled = await Promise.allSettled(ids.map((id) => fetchVideo(id)));
  return settled
    .flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    .filter((v) => v.status === 'COMPLETED' && !!v.draft);
}

/** 있는 것 중 아무거나 — 목록 자체를 먼저 캐시에 두고, 고르는 일은 캐시가 대신 하게 한다 */
export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * 발견한 id 목록을 기억한다.
 *
 * 목록 API 가 없으므로 처음엔 1~15 를 훑어야 하지만, 확실히 없는 id 로 404 를 반복해서
 * 맞으면 매 로드마다 요청 11개가 날아가고 콘솔이 404 로 더러워진다. 그래서 실제로
 * 존재한 것만 남겨두고 다음부터는 그 id 만 물어본다. (실측: 1, 2, 9, 14)
 */
const SCAN_CACHE_KEY = 'shortgong.feed.ids';

export function readScannedIds(): number[] | null {
  try {
    const raw = localStorage.getItem(SCAN_CACHE_KEY);
    if (!raw) return null;
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((n): n is number => typeof n === 'number') : null;
  } catch {
    return null;
  }
}

export function writeScannedIds(ids: number[]) {
  try {
    localStorage.setItem(SCAN_CACHE_KEY, JSON.stringify([...new Set(ids)].sort((a, b) => a - b)));
  } catch {
    /* 저장 실패(사생활모) 시에도 화면은 계속 돌아야 한다 */
  }
}

export function forgetScannedIds() {
  localStorage.removeItem(SCAN_CACHE_KEY);
}

/** 상태가 PROCESSING 인 동안 호출한다 */
export const isPending = (v: Pick<Video, 'status'>) => v.status === 'PROCESSING';

/**
 * 서버 영상을 피드 항목으로 옮긴다.
 *
 * 서버 응답에는 화면용 값(tag, tone, lesson…)이 없다 — 없는 값은 억지로 만들어내지 않고
 * 본문에 실제로 있는 것(제목, 본문, 좋아요/조회수)만 싣고 나머지는 최소한으로 채운다.
 * 특히 `draft` 가 비어 있으면 임베드를 걸지 않는다 — 없는 HTML 로 틀을 만들면 안 된다.
 */
export function toShort(v: Video): Short {
  return {
    id: String(v.id),
    title: v.title || '제목 없는 쇼츠',
    channel: v.author?.username ?? '나',
    tag: v.status === 'FAILED' ? '미완성' : '내 쇼츠',
    lesson: 1,
    totalLessons: 1,
    seconds: 0,
    topic: v.content.slice(0, 40),
    tone: 'mint',
    liked: false,
    likes: v.likeCount ?? 0,
    createdAgo: '',
    watched: false,
    html: v.draft || undefined,
  };
}