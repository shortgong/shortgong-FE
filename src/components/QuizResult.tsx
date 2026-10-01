import { useNavigate } from 'react-router-dom';
import { ActionDock } from './ActionDock';
import { Button } from './Button';
import { QuizTopBar } from './QuizTopBar';
import { TOPICS } from '../data/content';
import type { Question } from '../data/content';

export type QuizResult = Question & { ok: boolean };

type Props = {
  results: QuizResult[];
  correct: number;
  /** 결과 뱃지를 하나씩 공개하기 위한 진행 값 */
  reveal: number;
  onRetry: () => void;
  onToast: (text: string) => void;
};

export function QuizResultView({ results, correct, reveal, onRetry, onToast }: Props) {
  const navigate = useNavigate();
  const rows = [
    { k: '맞힌 문제', v: `${correct} / ${results.length}` },
    { k: '소요 시간', v: '2분 14초' },
    { k: '추천 학습', v: correct === results.length ? '다음 단계로' : '오답 다시 보기' },
  ];
  const weak = results.filter((r) => !r.ok);

  return (
    <div className="screen quiz">
      <QuizTopBar title="테스트 결과" onBack={() => navigate(-1)} />

      <div className="quiz__scroll quiz__scroll--result">
        <section className="scorecard" aria-label="테스트 결과 요약">
          <p className="t-caption scorecard__eyebrow">이해도 테스트 완료</p>
          <h2 className="t-display scorecard__grade">
            {correct === results.length ? '완벽해요!' : `${correct}문제 맞혔어요`}
          </h2>
          <div className="scorecard__badge-row">
            {results.map((r, i) => (
              <span
                key={r.id}
                className={`scorecard__badge ${r.ok ? 'is-ok' : 'is-no'}`}
                style={{ opacity: i < reveal ? 1 : 0, transform: `translateY(${i < reveal ? 0 : 6}px)` }}
              >
                {i + 1}번 {r.ok ? '정답' : '오답'}
              </span>
            ))}
          </div>
          <dl className="scorecard__rows">
            {rows.map((r) => (
              <div className="scorecard__row" key={r.k}>
                <dt className="t-body muted">{r.k}</dt>
                <dd className="t-subtitle">{r.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {weak.length > 0 && (
          <section className="review">
            <h3 className="t-title review__title">다시 보면 좋은 포인트</h3>
            <ul className="review__list">
              {weak.map((x) => (
                <li className="review__item" key={x.id}>
                  <span className="review__q t-label-plain">{x.hint}</span>
                  <span className="review__a t-body">{x.answer}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="review">
          <h3 className="t-title review__title">이후 추천 토픽</h3>
          <div className="chiprow">
            {TOPICS.slice(0, 4).map((t) => (
              <button key={t} type="button" className="chiprow__chip" onClick={() => navigate('/explore')}>
                {t}
              </button>
            ))}
          </div>
        </section>
      </div>

      <ActionDock>
        <Button
          variant="primary"
          onClick={() => {
            onRetry();
            onToast('다시 풀고 있어요');
          }}
        >
          다시 풀기
        </Button>
        <Button variant="ghost" onClick={() => navigate('/home')}>
          홈으로 가기
        </Button>
      </ActionDock>
    </div>
  );
}
