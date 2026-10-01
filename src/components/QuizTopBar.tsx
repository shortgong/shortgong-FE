import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';

type Props = {
  title: string;
  onBack: () => void;
  /** 0~100. 없으면 진행바를 그리지 않는다 */
  progress?: number;
  /** 우측 진행 표기 (예: 1/3) */
  step?: string;
};

/** 잠금·결과·대화 화면이 공유하는 상단바 */
export function QuizTopBar({ title, onBack, progress, step }: Props) {
  return (
    <header className="quiz__bar">
      <button type="button" className="quiz__back" aria-label="탐색으로 가기" onClick={onBack}>
        <Icon name="back" size={23} />
      </button>
      {progress == null ? (
        <h1 className="t-title quiz__bar-title">{title}</h1>
      ) : (
        <div className="quiz__bar-mid">
          <h1 className="t-title quiz__bar-title">{title}</h1>
          <ProgressBar value={progress} className="quiz__progress" />
        </div>
      )}
      {step ? <span className="quiz__step t-caption-plain muted">{step}</span> : <span className="quiz__bar-spacer" aria-hidden="true" />}
    </header>
  );
}
