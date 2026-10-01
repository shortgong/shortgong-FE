import { useMemo } from 'react';
import { STUDY_SETS, shortsOfSet } from '../data/content';
import type { StudySet } from '../data/content';
import { useStore } from '../store/context';

/**
 * 검색어를 스토어가 단일 소스로 들고 있으면 홈 검색창과 자연스럽게 공유된다.
 * 세트 제목·설명과 소속 쇼츠(제목/채널)까지 훑는다.
 */
export function useSetSearch() {
  const { state, setQuery, commitQuery, toast } = useStore();
  const q = state.query.trim();

  const list = useMemo(() => filterSets(STUDY_SETS, q), [q]);

  const submit = () => {
    commitQuery();
    toast(q ? `"${q}" 세트 ${list.length}개` : '학습 세트 이름을 입력해 주세요');
  };

  return { q, query: state.query, list, setQuery, submit };
}

function filterSets(sets: StudySet[], q: string) {
  if (!q) return sets;
  return sets.filter((set) => {
    const shorts = shortsOfSet(set);
    return (
      set.title.includes(q) ||
      set.desc.includes(q) ||
      shorts.some((s) => s.title.includes(q) || s.channel.includes(q))
    );
  });
}
