type Props = {
  done: number;
  goal: number;
  note: string;
};

export function MeGoalCard({ done, goal, goalPercent, note }: Props & { goalPercent: number }) {
  return (
    <div className="me__card">
      <div className="me__card-head">
        <span className="t-label">이번 주 목표</span>
        <span className="t-caption-plain me__card-pct">
          {done}/{goal}회
        </span>
      </div>
      <div className="me__card-track" aria-hidden="true">
        <span style={{ width: `${goalPercent}%` }} />
      </div>
      <p className="t-caption-plain muted me__card-note">{note}</p>
    </div>
  );
}
