import { createContext, useContext } from 'react';
import type { DAILY_TIPS, Question, Short } from '../data/content';

type Toast = { id: number; text: string } | null;

export type StoreState = {
  shorts: Short[];
  query: string;
  recentQueries: string[];
  likes: Record<string, boolean>;
  feedIndex: number;
  muted: boolean;
  tipIndex: number;
  answers: Record<string, string>;
  /** 세트별 감상 진행: 세트 id -> 본 편 index (0 부터) */
  setProgress: Record<string, number>;
  /** 세트 id -> 세트 전체를 끝까지 들었는지 */
  setDone: Record<string, boolean>;
  toast: Toast;
  toastSeq: number;
};

export type StoreValue = {
  state: StoreState;
  tip: (typeof DAILY_TIPS)[number];
  toggleLike: (id: string) => void;
  setQuery: (q: string) => void;
  commitQuery: () => void;
  clearRecent: () => void;
  setFeedIndex: (i: number) => void;
  toggleMute: () => void;
  nextTip: () => void;
  answer: (qid: string, value: string) => void;
  setWatched: (setId: string, index: number) => void;
  completeSet: (setId: string) => void;
  toast: (text: string) => void;
  clearToast: () => void;
  likedList: Short[];
  results: (q: Pick<Question, 'id' | 'accepted'>) => boolean;
};

export const StoreCtx = createContext<StoreValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
