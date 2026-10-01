import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findSet, questionsOfSet } from '../data/content';
import { useStore } from '../store/context';

/**
 * 퀴즈는 학습 세트에서만 진입한다.
 * 세트 영상을 끝까지 듣지 않았으면 잠금 상태로 되돌린다.
 */
export function useQuizGate() {
  const [params] = useSearchParams();
  const { state } = useStore();

  const studySet = findSet(params.get('set') ?? undefined);
  const questions = useMemo(() => (studySet ? questionsOfSet(studySet.id) : []), [studySet]);

  const unlocked =
    !!studySet &&
    (!!state.setDone[studySet.id] ||
      (state.setProgress[studySet.id] ?? 0) >= studySet.shortIds.length - 1);

  return { studySet, questions, unlocked, locked: !studySet || !unlocked || questions.length === 0 };
}
