import { fmtSec, popularSets, questionsOfSet, secondsOfSet, shortsOfSet } from '../data/content';
import type { StudySet } from '../data/content';
import './SetRail.css';

const TOP_N = 6;

const picks = popularSets().slice(0, TOP_N);

/** 홈의 '인기 세트' 레일이 차지하는 개수 — 나머지는 '다른 세트' 목록으로 넘어간다 */
export const SET_RAIL_COUNT = TOP_N;

const metaOf = (set: StudySet) =>
  `${shortsOfSet(set).length}편 · ${questionsOfSet(set.id).length}문제 · ${fmtSec(secondsOfSet(set))}`;

/** 홈의 '인기 세트' — 쇼츠가 아니라 세트 단위로만 진입한다 */
export function SetRail({ onPick }: { onPick: (id: string) => void }) {
  return (
    <ul className="srail" tabIndex={0} aria-label="인기 세트 가로 스크롤">
      {picks.map((set) => (
        <li key={set.id} className="srail__item">
          <button
            type="button"
            className="settile"
            onClick={() => onPick(set.id)}
            aria-label={`${set.title} — ${set.desc} — ${metaOf(set)}`}
          >
            <span className={`settile__cover settile__cover--${set.coverTone}`} aria-hidden="true" />

            <span className="settile__title">{set.title}</span>
            <span className="settile__meta">{metaOf(set)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}