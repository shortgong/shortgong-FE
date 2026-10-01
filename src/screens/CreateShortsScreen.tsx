import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionDock } from '../components/ActionDock';
import { Button } from '../components/Button';
import { CreateAttach } from '../components/CreateAttach';
import { CreateProgressCard } from '../components/CreateProgressCard';
import { Icon } from '../components/Icon';
import { TOPICS } from '../data/content';
import { useMakingProgress } from '../hooks/useMakingProgress';
import { useStore } from '../store/context';
import './CreateShortsScreen.css';

const LIMIT = 200;
const EXAMPLES = ['수학 미적분 개념 정리', '토익 필수 단어 100', '과학 화학 반응식'];

export function CreateShortsScreen() {
  const navigate = useNavigate();
  const { toast } = useStore();

  const [topic, setTopic] = useState('');
  const [attached, setAttached] = useState<string | null>(null);
  const { stage, pct, start, reset } = useMakingProgress(() => toast('쇼츠 만들었어요'));

  const busy = stage !== 'idle';
  const canSubmit = topic.trim().length > 0 && !busy;

  const pickTopic = (t: string) => {
    setTopic(t);
  };

  return (
    <div className="screen create">
      <header className="topbar topbar--center">
        <div className="topbar__slot">
          <button type="button" className="topbar__icon" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
            <Icon name="back" size={23} />
          </button>
        </div>
        <h1 className="t-title topbar__title">쇼츠 생성</h1>
        <div className="topbar__slot" />
      </header>

      <div className="create__scroll">
        <section className="create__field">
          <label className="t-label create__label" htmlFor="topic">
            학습할 내용을 입력하세요
          </label>
          <textarea
            id="topic"
            className="create__input t-body"
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, LIMIT))}
            placeholder="예) 미적분 도함수 개념을 초등학생도 이해하게 설명"
            rows={4}
            disabled={busy}
          />
          <div className="create__meta">
            <span className="t-caption-plain muted">
              {topic.length}/{LIMIT}
            </span>
            {topic && (
              <button type="button" className="create__clear" aria-label="내용 지우기" onClick={() => setTopic('')}>
                지우기
              </button>
            )}
          </div>
        </section>

        <section className="create__ex">
          <p className="t-label-plain muted create__ex-title">이런 주제로 만들어볼까요</p>
          <div className="create__chips">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                className="create__chip"
                onClick={() => pickTopic(e)}
                disabled={busy}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        <section className="create__upload-sec">
          <p className="t-label-plain muted create__ex-title">주제 분야</p>
          <div className="create__chips">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className={`create__chip ${topic === t ? 'is-on' : ''}`}
                onClick={() => pickTopic(t)}
                disabled={busy}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="create__upload-sec">
          <p className="t-label-plain muted create__ex-title">참고 자료 (선택)</p>
          <CreateAttach
            file={attached}
            disabled={busy}
            onPick={(name) => {
              setAttached(name);
              toast('자료를 첨부했어요');
            }}
            onClear={() => setAttached(null)}
          />
        </section>

        <CreateProgressCard stage={stage} pct={pct} />
      </div>

      <ActionDock>
        {stage === 'done' ? (
          <>
            <Button variant="primary" onClick={() => navigate('/watch')}>
              만들어진 쇼츠 바로 보기
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                setTopic('');
                setAttached(null);
              }}
            >
              하나 더 만들기
            </Button>
          </>
        ) : (
          <Button variant="primary" disabled={!canSubmit} onClick={start}>
            {stage === 'making' ? `만드는 중 ${pct}%` : '쇼츠 만들기'}
          </Button>
        )}
      </ActionDock>
    </div>
  );
}
