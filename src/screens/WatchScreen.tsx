import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ShortEmbed } from '../components/ShortEmbed';
import { useRandomServerShort, useVideoShort } from '../api/queries';
import { findSet, fmtCount, shortsOfSet } from '../data/content';
import { useDoubleTapLike } from '../hooks/useDoubleTapLike';
import { useShortScroller } from '../hooks/useShortScroller';
import { useStore } from '../store/context';
import './WatchScreen.css';

/* 방금 만든 세트의 미리보기 라벨 */
const NEW_SET_LABEL = '새 세트';

export function WatchScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, toggleLike, setWatched, completeSet, toast } = useStore();

  /* ---------- 모드: 방금 만든 세트 vs 학습 세트 — 둘 다 세트 단위다 ---------- */

  /* 세트 없이 들어오면 보여줄 것이 없다 (옛 '일반 피드' 는gone) */
  const hasEntry = !!params.get('set') || !!params.get('video');

  /* ?video=<id> — 방금 만든 세트의 미리보기. 서버에서 인제스트된 HTML 을 그대로 띄운다.
     캐시가 살아 있으면(refetchOnMount) 통신 없이 먼저 그린다. */
  const videoId = params.get('video');
  const { data: remote, isError: remoteFailed } = useVideoShort(videoId ? Number(videoId) : null);

  const studySet = findSet(params.get('set') ?? undefined);
  const setShorts = useMemo(() => (studySet ? shortsOfSet(studySet) : []), [studySet]);

  /* 백엔드에 실제로 존재하는 쇼츠 중 하나를 랜덤으로 고른다 — 목록 API 가 없어 정해진 id 중에서 고른다.
     고른 html 을 iframe 에 넣는다 — 이것이 진짜 백엔드 물건인지 눈으로 확인하는 길. */
  const { data: serverVideo } = useRandomServerShort();
  /* content 가 self-contained HTML 문서고, draft 는 평문 트랜스크립트다 */
  const serverHtml = serverVideo?.content;

  /* 쇼츠 하나만 따로 보는 길은 없다 — 세트(preview 또는 학습 세트)로만 들어온다 */
  const shorts = videoId ? (remote ? [remote] : []) : setShorts;

  /* 세트 안에서 어디부터 이어 볼지 — 마지막 감상 지점 */
  const resumeIndex = studySet ? Math.min(state.setProgress[studySet.id] ?? 0, Math.max(0, shorts.length - 1)) : 0;

  const { ref: stageRef, index, indexRef } = useShortScroller({
    count: shorts.length,
    resumeIndex,
    onMute: () => toast('음소거 상태는 준비 중이에요'),
  });

  const dbl = useDoubleTapLike({
    getId: () => shorts[indexRef.current]?.id ?? '',
    liked: () => !!state.likes[shorts[indexRef.current]?.id ?? ''],
    onLike: toggleLike,
  });

  /* 세트 없이 들어온 진입은 탐색으로 돌려보낸다 — 세트 없는 감상은 존재하지 않는다 */
  useEffect(() => {
    if (!hasEntry) navigate('/explore', { replace: true });
  }, [hasEntry, navigate]);

  /* 감상한 편을 세트 진행 상태에 반영 — 마지막 편까지 들으면 세트 완료 + 퀴즈 개방 */
  useEffect(() => {
    if (!studySet) return;
    setWatched(studySet.id, index);
    if (index >= shorts.length - 1) completeSet(studySet.id);
  }, [index, studySet, shorts.length, setWatched, completeSet]);

  const current = shorts[index];

  /* 서버 영상이 아직 오지 않았으면 빈 화면 대신 이유를 말해 준다 */
  if (!current) {
    const failed = !!remoteFailed;
    return (
      <div className="watch">
        <div className="watch__sr" role="status" aria-live="polite">
          {failed ? '영상을 불러오지 못했어요' : '불러오는 중'}
        </div>
        {failed && (
          <div className="watch__pos">
            <button type="button" className="watch__setExit" onClick={() => navigate('/home')} aria-label="홈으로">
              <Icon name="back" size={20} />
            </button>
            <p className="t-label-plain watch__posLabel">영상을 불러오지 못했어요</p>
          </div>
        )}
      </div>
    );
  }

  const isLiked = !!state.likes[current.id];

  return (
    <div className="watch">
      {/* 상단 위치 표시는 세트 공통. 왼쪽=무엇을 보고 있는지, 오른쪽=몇 번째 중 몇 번째 */}
      <header
        className="watch__pos"
        aria-label={`${studySet ? studySet.title : NEW_SET_LABEL} ${index + 1}번째, 전체 ${shorts.length}번째`}
      >
        {studySet && (
          <button type="button" className="watch__setExit" onClick={() => navigate('/explore')} aria-label="탐색으로">
            <Icon name="back" size={20} />
          </button>
        )}
        <p className="t-label-plain watch__posLabel" aria-hidden="true">
          {studySet ? studySet.title : NEW_SET_LABEL}
        </p>
        <p className="t-caption-plain watch__posCount" aria-hidden="true">
          {index + 1}/{shorts.length}
        </p>
      </header>

      <div
        ref={stageRef}
        className="watch__stage"
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
                <div className="slide__head">
                  <button
                    type="button"
                    className="slide__close"
                    aria-label="감시 종료"
                    onClick={() => navigate('/home')}
                  >
                    <Icon name="more" size={22} />
                  </button>
                </div>
              </header>

              {/* 백엔드에서 받은 html 이 있으면 그것을 우선한다 — '이게 진짜 백엔드 물건인가'
                  를 눈으로 확인할 수 있다. 없으면 기존 여백 유지. */}
              {(serverHtml ?? s.html) ? (
                <ShortEmbed id={s.id} html={serverHtml ?? s.html} tone={s.tone} title={s.title} active={active} />
              ) : (
                <div className="slide__spacer" />
              )}

              {/* 우측 레일 — 하단 메타와 겹치지 않도록 세로 중앙에 둔다 */}
              <nav className="rail" aria-label="액션">
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
