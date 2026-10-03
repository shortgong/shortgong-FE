import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ChannelRail } from '../components/ChannelRail';
import { Icon } from '../components/Icon';
import { SET_RAIL_COUNT, SetRail } from '../components/SetRail';
import { SetLine } from '../components/SetLine';
import { TabBar } from '../components/TabBar';
import { fmtSec, popularSets, questionsOfSet, secondsOfSet, shortsOfSet } from '../data/content';
import { useStore } from '../store/context';
import './StudyHomeScreen.css';

export function StudyHomeScreen() {
  const navigate = useNavigate();
  const { state, tip, nextTip, setQuery, commitQuery, clearRecent, toast } = useStore();
  const [showRecent, setShowRecent] = useState(false);

  /* 레일이 밀어낸 나머지 세트만 목록으로 — 같은 세트를 두 번 보여주지 않는다 */
  const moreSets = popularSets().slice(SET_RAIL_COUNT);

  const search = () => {
    if (!state.query.trim()) {
      setShowRecent(true);
      toast('검색어를 입력해 주세요');
      return;
    }
    commitQuery();
    setShowRecent(false);
    navigate('/explore');
  };

  const pick = (q: string) => {
    setQuery(q);
    commitQuery();
    setShowRecent(false);
    navigate('/explore');
  };

  /* 세트 단위로만 진입한다 — 쇼츠 하나만 따로 보는 길은 없다 */
  const pickSet = (id: string) => navigate(`/watch?set=${id}`);

  return (
    <div className="screen">
      <div className="screen__body">
        <div className="section home__search">
          <div className="searchbar">
            <span className="searchbar__icon" aria-hidden="true">
              <Icon name="search" size={18} />
            </span>
            <input
              className="t-body searchbar__input"
              value={state.query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowRecent(true)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="배우고 싶은 주제를 검색해 보세요"
              aria-label="주제 검색"
              role="combobox"
              aria-expanded={showRecent}
              aria-controls="recent-search"
            />
            {state.query ? (
              <button type="button" className="searchbar__x" aria-label="검색어 지우기" onClick={() => setQuery('')}>
                <Icon name="close" size={14} />
              </button>
            ) : null}
            <button type="button" className="searchbar__go" onClick={search} aria-label="검색 실행">
              검색
            </button>
          </div>

          {showRecent && (
            <div className="recent" id="recent-search">
              <div className="recent__head">
                <span className="t-label-plain muted">최근 검색</span>
                {state.recentQueries.length > 0 && (
                  <button type="button" className="recent__clear t-caption-plain" onClick={clearRecent}>
                    전체 삭제
                  </button>
                )}
              </div>
              {state.recentQueries.length === 0 ? (
                <p className="t-body muted recent__empty">최근 검색어가 없어요</p>
              ) : (
                <ul className="recent__list">
                  {state.recentQueries.map((q) => (
                    <li key={q}>
                      <button type="button" className="recent__item" onClick={() => pick(q)}>
                        <Icon name="clock" size={16} />
                        <span className="recent__q t-body">{q}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="section home__block-head">
          <h2 className="t-title">인기 세트</h2>
          <button type="button" className="t-label-plain muted home__more" onClick={() => navigate('/explore')}>
            더보기
          </button>
        </div>

        <div className="home__rail">
          <SetRail onPick={pickSet} />
        </div>

        {moreSets.length > 0 && (
          <>
            <div className="section home__block-head">
              <h2 className="t-title">다른 세트</h2>
              <button type="button" className="t-label-plain muted home__more" onClick={() => navigate('/explore')}>
                탐색
              </button>
            </div>

            <ul className="section home__sets">
              {moreSets.map((set) => (
                <li key={set.id}>
                  <SetLine
                    title={set.title}
                    tone={set.coverTone}
                    meta={`${shortsOfSet(set).length}편 · ${questionsOfSet(set.id).length}문제 · ${fmtSec(secondsOfSet(set))}`}
                    onClick={() => pickSet(set.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="section home__block-head">
          <h2 className="t-title">채널</h2>
        </div>

        <div className="home__channels">
          <ChannelRail onPick={pick} />
        </div>

        <div className="section home__tip">
          <button type="button" className="tipcard" onClick={nextTip} aria-label="학습 팁 다음 보기">
            <span className="tipcard__icon" aria-hidden="true">
              <Icon name="bulb" size={20} />
            </span>
            <div className="tipcard__text">
              <p className="t-subtitle">{tip.title}</p>
              <p className="t-label-plain muted tipcard__body">{tip.body}</p>
            </div>
            <span className="tipcard__next" aria-hidden="true">
              <Icon name="chevron" size={16} />
            </span>
          </button>
        </div>

        <div className="section home__create">
          <Button onClick={() => navigate('/create')}>
            새 세트 만들기
          </Button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
