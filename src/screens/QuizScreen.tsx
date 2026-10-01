import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionDock } from '../components/ActionDock';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { QuizLocked } from '../components/QuizLocked';
import { QuizResultView } from '../components/QuizResult';
import type { QuizResult } from '../components/QuizResult';
import { QuizTopBar } from '../components/QuizTopBar';
import { useQuizGate } from '../hooks/useQuizGate';
import { useTypewriter } from '../hooks/useTypewriter';
import { useStore } from '../store/context';
import './QuizScreen.css';

const WORD_LIMIT = 60;
const REVEAL_MS = 340;

export function QuizScreen() {
  const navigate = useNavigate();
  const { state, answer, toast } = useStore();
  const { studySet, questions, locked } = useQuizGate();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [judged, setJudged] = useState(false);
  const [done, setDone] = useState(false);
  const [reveal, setReveal] = useState(0);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = questions[step];
  const value = q ? state.answers[q.id] ?? '' : '';
  const transcript = useMemo(() => questions.slice(0, step), [step, questions]);
  const typed = useTypewriter(questions[0]?.prompt, step === 0);

  const results: QuizResult[] = useMemo(
    () =>
      questions.map((x) => {
        const raw = (state.answers[x.id] ?? '').trim();
        return { ...x, ok: !!raw && x.accepted.some((a) => a.toLowerCase() === raw.toLowerCase()) };
      }),
    [state.answers, questions],
  );
  const correct = results.filter((r) => r.ok).length;

  /* 주관식일 때만 입력 포커스 (외부 시스템 동기화) */
  useEffect(() => {
    if (!q || q.kind !== 'text') return;
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [step, q]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [step, judged, typed]);

  const resetTurn = () => {
    setDraft('');
    setJudged(false);
  };

  const submit = () => {
    const v = (draft || value).trim();
    if (!v) return;
    answer(q.id, v);
    setJudged(true);
  };

  const next = () => {
    if (step + 1 >= questions.length) {
      setDone(true);
      setReveal(0);
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setReveal(i);
        if (i >= results.length + 1) clearInterval(t);
      }, REVEAL_MS);
      return;
    }
    resetTurn();
    setStep((s) => s + 1);
  };

  const retry = () => {
    setDone(false);
    resetTurn();
    setStep(0);
  };

  if (locked) {
    return (
      <QuizLocked
        studySet={studySet}
        onBack={() => navigate('/explore')}
        onPickSet={() => navigate('/explore')}
        onResume={() => navigate(`/watch?set=${studySet!.id}`)}
      />
    );
  }

  if (done) {
    return <QuizResultView results={results} correct={correct} reveal={reveal} onRetry={retry} onToast={toast} />;
  }

  return (
    <div className="screen quiz">
      <QuizTopBar
        title="이해도 테스트"
        onBack={() => navigate(-1)}
        progress={((step + 1) / questions.length) * 100}
        step={`${step + 1}/${questions.length}`}
      />

      <div className="quiz__scroll" ref={scrollerRef}>
        {transcript.map((t) => {
          const asked = state.answers[t.id];
          const raw = (asked ?? '').trim();
          const ok = !!raw && t.accepted.some((a) => a.toLowerCase() === raw.toLowerCase());
          return (
            <div className="quiz__pair" key={t.id}>
              <div className={`bubble bubble--user ${asked ? '' : 'is-hidden'}`}>
                <p className="t-body">{asked}</p>
              </div>
              <div className="bubble bubble--answer">
                <p className="t-body">{t.prompt}</p>
              </div>
              <div className={`judge ${ok ? 'is-ok' : 'is-no'}`}>
                <Icon name={ok ? 'check' : 'close'} size={15} />
                <span className="t-label">{ok ? '정답이에요!' : `정답은 "${t.answer}" 입니다`}</span>
              </div>
            </div>
          );
        })}

        <div className="quiz__pair">
          {step === 0 ? (
            <div className="bubble bubble--answer">
              <p className="t-body">{typed}</p>
              {typed.length < q.prompt.length && <span className="caret" aria-hidden="true" />}
            </div>
          ) : (
            <div className="bubble bubble--answer">
              <p className="t-body">{q.prompt}</p>
            </div>
          )}

          {step > 0 && (
            <div className={`bubble bubble--user ${value ? '' : 'is-hidden'}`}>
              <p className="t-body">{value}</p>
            </div>
          )}
        </div>

        {q.kind === 'choice' && !judged && (
          <ul className="choices" aria-label="선택지">
            {q.choices?.map((c) => {
              const on = value === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`choice ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => answer(q.id, c.id)}
                  >
                    <span className={`choice__num ${on ? 'choice__num--on' : ''}`}>{c.id}</span>
                    <span className={`choice__label t-subtitle ${on ? 'choice__label--on' : ''}`}>{c.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {judged && (
          <div className={`judge judge--inline ${results[step].ok ? 'is-ok' : 'is-no'}`}>
            <Icon name={results[step].ok ? 'check' : 'close'} size={15} />
            <span className="t-label">
              {results[step].ok ? '정답이에요!' : `정답은 "${q.answer}" 입니다`}
            </span>
          </div>
        )}
      </div>

      <ActionDock>
        {q.kind === 'text' ? (
          <div className={`composer ${judged ? 'is-done' : ''}`}>
            <div className="composer__field">
              <input
                ref={inputRef}
                className="composer__input t-body"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, WORD_LIMIT))}
                onKeyDown={(e) => e.key === 'Enter' && !judged && submit()}
                placeholder="정답을 입력하세요"
                aria-label="정답 입력"
                disabled={judged}
              />
              <span className="composer__count t-caption-plain">
                {draft.length}/{WORD_LIMIT}
              </span>
            </div>
            <button
              type="button"
              className={`composer__send ${draft.trim() && !judged ? 'is-ready' : ''}`}
              onClick={judged ? next : submit}
              disabled={!judged && !draft.trim()}
              aria-label={judged ? '다음 문제' : '답변 제출'}
            >
              <Icon name={judged ? 'check' : 'send'} size={20} />
            </button>
          </div>
        ) : (
          <Button variant="primary" disabled={!judged && !value} onClick={() => (judged ? next() : submit())}>
            {judged ? (step + 1 >= questions.length ? '결과 보기' : '다음 문제') : value ? '답변 제출' : '선택 후 제출'}
          </Button>
        )}
      </ActionDock>
    </div>
  );
}
