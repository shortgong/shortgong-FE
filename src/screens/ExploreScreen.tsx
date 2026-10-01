import { useNavigate } from 'react-router-dom';
import { SetLine } from '../components/SetLine';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { fmtSec, questionsOfSet, secondsOfSet, shortsOfSet } from '../data/content';
import { useSetSearch } from '../hooks/useSetSearch';
import './ExploreScreen.css';

export function ExploreScreen() {
  const navigate = useNavigate();
  const { q, query, list, setQuery, submit } = useSetSearch();

  return (
    <div className="screen explore">
      <TopBar title="탐색" back={false} />
      <div className="explore__scroll">
        <div className="explore__search">
          <span className="explore__search-icon" aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <circle cx="8.6" cy="8.6" r="5.9" stroke="currentColor" strokeWidth="1.7" />
              <path d="M13.2 13.2L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="explore__input t-body"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="학습 세트 이름이나 키워드를 검색해 보세요"
            aria-label="학습 세트 검색"
          />
          {query && (
            <button type="button" className="explore__x" aria-label="검색어 지우기" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
          <button type="button" className="explore__go t-label" onClick={submit}>
            검색
          </button>
        </div>

        <p className="t-caption-plain muted explore__count">{list.length}개의 학습 세트</p>

        <ul className="explore__sets">
          {list.map((set) => (
            <li key={set.id}>
              <SetLine
                title={set.title}
                tone={set.coverTone}
                meta={`${shortsOfSet(set).length}편 · ${questionsOfSet(set.id).length}문제 · ${fmtSec(secondsOfSet(set))}`}
                onClick={() => navigate(`/watch?set=${set.id}`)}
              />
            </li>
          ))}
        </ul>

        {list.length === 0 && (
          <div className="explore__empty">
            <p className="t-subtitle">"{q}" 세트 검색 결과가 없어요</p>
            <p className="t-body muted">다른 키워드로 검색하거나 새 쇼츠로 세트를 만들어 보세요</p>
            <button type="button" className="explore__empty-cta t-label" onClick={() => navigate('/create')}>
              쇼츠 만들러 가기
            </button>
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}
