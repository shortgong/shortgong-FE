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