import type { MakeStage } from '../hooks/useMakingProgress';

const NOTE: Record<Exclude<MakeStage, 'idle'>, string> = {
  making: '대본을 쓰고 있어요. 잠시만 기다려 주세요',
  done: '라이브러리에서 확인하실 수 있어요',
};

/** 생성 진행 카드. stage 가 idle 이면 렌더링하지 않는다 */
export function CreateProgressCard({ stage, pct }: { stage: MakeStage; pct: number }) {
  if (stage === 'idle') return null;

  return (
    <section className="making" role="status" aria-live="polite">
      <div className="making__head">
        <span className="t-label">{stage === 'done' ? '완료' : '만드는 중'}</span>
        <span className="t-label making__pct">{pct}%</span>
      </div>
      <div className="making__track">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="t-caption-plain muted making__note">{NOTE[stage]}</p>
    </section>
  );
}
