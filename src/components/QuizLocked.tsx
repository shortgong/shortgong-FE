import { Button } from './Button';
import { Icon } from './Icon';
import { QuizTopBar } from './QuizTopBar';
import type { StudySet } from '../data/content';

type Props = {
  studySet: StudySet | undefined;
  onBack: () => void;
  onPickSet: () => void;
  onResume: () => void;
};

/** 세트를 끝까지 듣지 않았거나 세트 없이 진입한 경우 */
export function QuizLocked({ studySet, onBack, onPickSet, onResume }: Props) {
  return (
    <div className="screen quiz">
      <QuizTopBar title="이해도 테스트" onBack={onBack} />
      <div className="quiz__scroll quiz__scroll--result">
        <div className="quiz__locked">
          <span className="quiz__lockedMark" aria-hidden="true">
            <Icon name="quiz" size={26} />
          </span>
          <h2 className="t-display quiz__lockedTitle">
            {studySet ? '세트를 끝까지 들어주세요' : '학습 세트에서만 풀 수 있어요'}
          </h2>
          <p className="t-body muted quiz__lockedDesc">
            {studySet
              ? `"${studySet.title}" 세트의 마지막 편까지 들으면 이 테스트가 열립니다.`
              : '퀴즈는 쇼츠를 순서대로 묶은 학습 세트와 짝지어 있습니다. 세트를 골라 감상한 뒤 문제를 풀어보세요.'}
          </p>
          <div className="quiz__lockedActions">
            <Button onClick={onPickSet}>탐색에서 세트 고르기</Button>
            {studySet && (
              <Button variant="ghost" onClick={onResume}>
                세트 이어 보기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
