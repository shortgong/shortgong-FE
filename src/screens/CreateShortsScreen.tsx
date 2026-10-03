import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionDock } from '../components/ActionDock';
import { Button } from '../components/Button';
import { CreateProgressCard } from '../components/CreateProgressCard';
import { Icon } from '../components/Icon';
import { useMakingProgress } from '../hooks/useMakingProgress';
import { useAuth } from '../store/authContext';
import { useStore } from '../store/context';
import './CreateShortsScreen.css';

const LIMIT = 200;
/* 예시는 '무엇을 쓸지' Bramd 까지 정하기 귀찮을 때 쓰는 지름길일 뿐이다.
   입력 수단은 텍스트 하나뿐 — 분야 고르기·자료 첨부 같은 선택지를 두지 않는다. */
const EXAMPLES = [
  '미적분 도함수 개념을 초등학생도 이해하게 설명',
  '토익 빈출 단어를Native 화자가 발음까지 연습하게 만들어줘',
  '세포 소기관 구조를 순서대로 짚어주는 설명 세트',
];

export function CreateShortsScreen() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const { status } = useAuth();

  const [brief, setBrief] = useState('');
  const onCreated = useCallback(() => toast('세트를 만들었어요'), [toast]);
  const onFailed = useCallback((msg: string) => toast(msg), [toast]);
  const { stage, pct, video, start, reset } = useMakingProgress({ onDone: onCreated, onError: onFailed });

  const busy = stage === 'making';
  const canSubmit = brief.trim().length > 0 && !busy && stage === 'idle';

  /* 만들려면 토큰이 있어야 한다 — 화면은 열어두고, 누른 순간 로그인으로 보낸다.
     401 을 그대로 노출하면 "무슨 오류인지"를 알 수 없으므로 미리 막는다. */
  const submit = () => {
    if (status !== 'authed') {
      toast('로그인하면 세트를 만들 수 있어요');
      navigate('/onboarding');
      return;
    }
    start(brief);
  };

  return (
    <div className="screen create">
      <header className="topbar topbar--center">
        <div className="topbar__slot">
          <button type="button" className="topbar__icon" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
            <Icon name="back" size={23} />
          </button>
        </div>
        <h1 className="t-title topbar__title">세트 생성</h1>
        <div className="topbar__slot" />
      </header>

      <div className="create__scroll">
        <section className="create__field">
          <label className="t-label create__label" htmlFor="brief">
            어떤 세트를 만들까요
          </label>
          <textarea
            id="brief"
            className="create__input t-body"
            value={brief}
            onChange={(e) => setBrief(e.target.value.slice(0, LIMIT))}
            placeholder="예) 미적분 도함수 개념을 초등학생도 이해하게 설명"
            rows={6}
            disabled={busy}
          />
          <div className="create__meta">
            <span className="t-caption-plain muted">
              {brief.length}/{LIMIT}
            </span>
            {brief && (
              <button type="button" className="create__clear" aria-label="내용 지우기" onClick={() => setBrief('')}>
                지우기
              </button>
            )}
          </div>
        </section>

        <section className="create__ex">
          <p className="t-label-plain muted create__ex-title">이런 요청은 어때요</p>
          <div className="create__chips">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                className="create__chip"
                onClick={() => setBrief(e)}
                disabled={busy}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        <CreateProgressCard stage={stage} pct={pct} />
      </div>

      <ActionDock>
        {stage === 'done' ? (
          <>
            <Button variant="primary" onClick={() => navigate(video ? `/watch?video=${video.id}` : '/explore')}>
              만든 세트 바로 보기
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                setBrief('');
              }}
            >
              하나 더 만들기
            </Button>
          </>
        ) : stage === 'failed' ? (
          <Button
            variant="primary"
            onClick={() => {
              reset();
              setBrief('');
            }}
          >
            다시 입력하기
          </Button>
        ) : (
          <Button variant="primary" disabled={!canSubmit} onClick={submit}>
            {stage === 'making' ? `만드는 중 ${pct}%` : '세트 만들기'}
          </Button>
        )}
      </ActionDock>
    </div>
  );
}
