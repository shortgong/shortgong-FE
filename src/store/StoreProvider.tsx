import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { DAILY_TIPS, SHORTS } from '../data/content';
import { StoreCtx, type StoreState, type StoreValue } from './context';

type Action =
  | { type: 'toggle-like'; id: string }
  | { type: 'set-query'; q: string }
  | { type: 'commit-query' }
  | { type: 'clear-recent' }
  | { type: 'set-feed-index'; i: number }
  | { type: 'toggle-mute' }
  | { type: 'next-tip' }
  | { type: 'answer'; qid: string; value: string }
  | { type: 'set-watched'; setId: string; index: number }
  | { type: 'complete-set'; setId: string }
  | { type: 'toast'; text: string }
  | { type: 'toast-clear' };

const KEY = 'shortgong.v1';

type Persisted = Pick<
  StoreState,
  'likes' | 'answers' | 'recentQueries' | 'tipIndex' | 'setProgress' | 'setDone'
>;

function load(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

const initial: StoreState = {
  shorts: SHORTS,
  query: '',
  recentQueries: ['미적분', '세포 소기관', '토픽 동사'],
  likes: Object.fromEntries(SHORTS.map((s) => [s.id, s.liked])),
  feedIndex: 0,
  muted: false,
  tipIndex: 0,
  answers: {},
  setProgress: {},
  setDone: {},
  toast: null,
  toastSeq: 0,
  ...load(),
};

function reducer(s: StoreState, a: Action): StoreState {
  switch (a.type) {
    case 'toggle-like':
      return { ...s, likes: { ...s.likes, [a.id]: !s.likes[a.id] } };
    case 'set-query':
      return { ...s, query: a.q };
    case 'commit-query': {
      const q = s.query.trim();
      if (!q) return s;
      return { ...s, recentQueries: [q, ...s.recentQueries.filter((x) => x !== q)].slice(0, 6) };
    }
    case 'clear-recent':
      return { ...s, recentQueries: [] };
    case 'set-feed-index':
      return { ...s, feedIndex: a.i };
    case 'toggle-mute':
      return { ...s, muted: !s.muted };
    case 'next-tip':
      return { ...s, tipIndex: (s.tipIndex + 1) % DAILY_TIPS.length };
    case 'answer':
      return { ...s, answers: { ...s.answers, [a.qid]: a.value } };
    case 'set-watched': {
      const cur = s.setProgress[a.setId] ?? 0;
      if (a.index <= cur) return s;
      return { ...s, setProgress: { ...s.setProgress, [a.setId]: a.index } };
    }
    case 'complete-set':
      return s.setDone[a.setId] ? s : { ...s, setDone: { ...s.setDone, [a.setId]: true } };
    case 'toast': {
      const toast = { id: s.toastSeq + 1, text: a.text } as const;
      return { ...s, toast, toastSeq: s.toastSeq + 1 };
    }
    case 'toast-clear':
      return s.toast ? { ...s, toast: null } : s;
    default:
      return s;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const toggleLike = useCallback((id: string) => dispatch({ type: 'toggle-like', id }), []);
  const toast = useCallback((text: string) => dispatch({ type: 'toast', text }), []);
  const clearToast = useCallback(() => dispatch({ type: 'toast-clear' }), []);
  const setQuery = useCallback((q: string) => dispatch({ type: 'set-query', q }), []);
  const commitQuery = useCallback(() => dispatch({ type: 'commit-query' }), []);
  const clearRecent = useCallback(() => dispatch({ type: 'clear-recent' }), []);
  const setFeedIndex = useCallback((i: number) => dispatch({ type: 'set-feed-index', i }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'toggle-mute' }), []);
  const nextTip = useCallback(() => dispatch({ type: 'next-tip' }), []);
  const answer = useCallback(
    (qid: string, value: string) => dispatch({ type: 'answer', qid, value }),
    [],
  );

  /* 좋아요 / 저장 / 정답 / 최근검색은 새로고침 후에도 유지된다 */
  useEffect(() => {
    const data: Persisted = {
      likes: state.likes,
      answers: state.answers,
      recentQueries: state.recentQueries,
      tipIndex: state.tipIndex,
      setProgress: state.setProgress,
      setDone: state.setDone,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* 용량 초과 등 무시 */
    }
  }, [
    state.likes,
    state.answers,
    state.recentQueries,
    state.tipIndex,
    state.setProgress,
    state.setDone,
  ]);

  const setWatched = useCallback((setId: string, index: number) => {
    dispatch({ type: 'set-watched', setId, index });
  }, []);

  const completeSet = useCallback((setId: string) => {
    dispatch({ type: 'complete-set', setId });
  }, []);

  const value = useMemo<StoreValue>(() => {
    const shorts = state.shorts.map((s) => ({
      ...s,
      liked: !!state.likes[s.id],
    }));
    return {
      state,
      tip: DAILY_TIPS[state.tipIndex],
      toggleLike,
      setQuery,
      commitQuery,
      clearRecent,
      setFeedIndex,
      toggleMute,
      nextTip,
      answer,
      setWatched,
      completeSet,
      toast,
      clearToast,
      likedList: shorts.filter((s) => s.liked),
      results: (q) => {
        const v = (state.answers[q.id] ?? '').trim().toLowerCase();
        return v.length > 0 && q.accepted.some((a) => a.toLowerCase() === v);
      },
    };
  }, [
    state,
    toggleLike,
    setQuery,
    commitQuery,
    clearRecent,
    setFeedIndex,
    toggleMute,
    nextTip,
    answer,
    setWatched,
    completeSet,
    toast,
    clearToast,
  ]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
