import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ShortEmbed } from '../components/ShortEmbed';
import { findSet, fmtCount, shortsOfSet } from '../data/content';
import { useDoubleTapLike } from '../hooks/useDoubleTapLike';
import { useShortScroller } from '../hooks/useShortScroller';
import { useStore } from '../store/context';
import './WatchScreen.css';

const SEGMENT_MS = 5200;

export function WatchScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, toggleLike, setWatched, completeSet, toast } = useStore();

  /* ---------- 모드: 일반 피드 vs 학습 세트 ---------- */
  const studySet = findSet(params.get('set') ?? undefined);
  const setShorts = useMemo(() => (studySet ? shortsOfSet(studySet) : []), [studySet]);
  const shorts = studySet ? setShorts : state.shorts;

  /* ?at=<id> 딥링크: 해당 쇼츠 위치로 바로 이동 (일반 모드 전용) */
  const deepLinkAt = params.get('at');
  const deepIndex = !studySet && deepLinkAt ? shorts.findIndex((s) => s.id === deepLinkAt) : -1;

  /* 세트 모드에서는 마지막 감상 지점부터 이어 듣기 */
  const resumeIndex = studySet ? Math.min(state.setProgress[studySet.id] ?? 0, Math.max(0, shorts.length - 1)) : 0;

  const { ref: stageRef, index, indexRef } = useShortScroller({
    count: shorts.length,
    deepIndex,
    resumeIndex,
    onMute: () => toast('음소거 상태는 준비 중이에요'),
  });

  const dbl = useDoubleTapLike({
    getId: () => shorts[indexRef.current].id,
    liked: () => !!state.likes[shorts[indexRef.current].id],
    onLike: toggleLike,
  });

  /* 감상한 편을 세트 진행 상태에 반영 — 마지막 편까지 들으면 세트 완료 + 퀴즈 개방 */
  useEffect(() => {
    if (!studySet) return;
    setWatched(studySet.id, index);
    if (index >= shorts.length - 1) completeSet(studySet.id);
  }, [index, studySet, shorts.length, setWatched, completeSet]);

  const current = shorts[index];
  const isLiked = !!state.likes[current.id];

  return (
    <div className="watch">
      {studySet && (
        <header className="watch__setbar">
          <button type="button" className="watch__setExit" onClick={() => navigate('/explore')} aria-label="탐색으로">
            <Icon name="back" size={20} />
          </button>
          <div className="watch__setInfo">
            <p className="t-label-plain watch__setName">{studySet.title}</p>
            <p className="t-caption-plain watch__setCount">
              {Math.min(index + 1, shorts.length)}/{shorts.length}편
            </p>
          </div>
        </header>
      )}

      <div
        ref={stageRef}
        className={`watch__stage ${studySet ? 'watch__stage--set' : ''}`}
        {...dbl.bind}
      >
        {shorts.map((s, i) => {
          const active = i === index;
          const liked = !!state.likes[s.id];
          const isLastOfSet = !!studySet && i === shorts.length - 1;
          return (
            <section
              key={s.id}
              className={`slide ${active ? 'is-active' : ''}`}
              aria-hidden={!active}
              inert={!active}
              aria-label={`${s.title} · ${i + 1}/${shorts.length}`}
            >
              <div className={`slide__bg slide__bg--${s.tone}`} aria-hidden="true" />

              <header className="slide__top">
                <div
                  className="slide__bars"
                  role="progressbar"
                  aria-label="재생 진행"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={active ? undefined : 0}
                >
                  {shorts.map((x, j) => (
                    <span key={x.id} className={j < i ? 'is-done' : ''}>
                      {j === i && (
                        <i
                          style={{
                            animationDuration: `${SEGMENT_MS}ms`,
                            animationPlayState: dbl.dragging ? 'paused' : 'running',
                          }}
                        />
                      )}
                    </span>
                  ))}
                </div>

                <div className="slide__head">
                  <span className="chip">{s.tag}</span>
                  <button
                    type="button"
                    className="slide__close"
                    aria-label="피드 닫기"
                    onClick={() => navigate('/home')}
                  >
                    <Icon name="more" size={22} />
                  </button>
                </div>
              </header>

              {/* 임베드가 없는 쇼츠는 기존 여백을 유지해 레이아웃이 무너지지 않게 한다 */}
              {s.html ? (
                <ShortEmbed id={s.id} html={s.html} tone={s.tone} title={s.title} active={active} />
              ) : (
                <div className="slide__spacer" />
              )}

              {/* 우측 레일 — 하단 메타와 겹치지 않도록 세로 중앙에 둔다 */}
              <nav className="rail" aria-label="쇼츠 액션">
                <button
                  type="button"
                  className={`rail__act rail__act--like ${liked ? 'is-set' : ''}`}
                  aria-pressed={liked}
                  onClick={() => toggleLike(s.id)}
                >
                  <span className="rail__glyph" aria-hidden="true">
                    <Icon name="heart" size={26} />
                  </span>
                  <span className="rail__count">{fmtCount(s.likes + (liked && !s.liked ? 1 : 0))}</span>
                </button>

                <button type="button" className="rail__act" onClick={() => toast('링크를 복사했어요')}>
                  <span className="rail__glyph" aria-hidden="true">
                    <Icon name="share" size={26} />
                  </span>
                </button>
              </nav>

              <footer className="slide__meta">
                <span className={`slide__avatar slide__avatar--${s.tone}`} aria-hidden="true" />
                <div className="slide__meta-text">
                  <p className="t-label slide__channel">{s.channel}</p>
                  <h2 className="t-title slide__title">{s.title}</h2>

                  {/* 세트의 마지막 편에서만 퀴즈로 연결 */}
                  {isLastOfSet && (
                    <button
                      type="button"
                      className="slide__cta slide__cta--quiz"
                      onClick={() => navigate(`/quiz?set=${studySet!.id}`)}
                    >
                      {studySet!.quizCta}
                    </button>
                  )}
                </div>
              </footer>
            </section>
          );
        })}

        {dbl.burst && (
          <span key={dbl.burst.key} className="burst" style={{ left: dbl.burst.x, top: dbl.burst.y }} aria-hidden="true">
            <Icon name="heart" size={92} />
          </span>
        )}
      </div>

      <div className="watch__sr" role="status" aria-live="polite">
        {index + 1} / {shorts.length} · {isLiked ? '좋아요 함' : ''}
      </div>
    </div>
  );
}
