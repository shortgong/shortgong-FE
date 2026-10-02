import { useNavigate } from 'react-router-dom';
import { MeGoalCard } from '../components/MeGoalCard';
import { MeProfile } from '../components/MeProfile';
import { MeRows } from '../components/MeRows';
import type { MeRow } from '../components/MeRows';
import { MeStats } from '../components/MeStats';
import { TabBar } from '../components/TabBar';
import { TopBar } from '../components/TopBar';
import { STUDY_SETS } from '../data/content';
import { useAuth } from '../store/authContext';
import { useStore } from '../store/context';
import './MeScreen.css';

const STATS = [
  { k: '완료한 테스트', v: '12' },
  { k: '연속 학습', v: '7일' },
  { k: '학습 세트', v: String(STUDY_SETS.length) },
] as const;

/* 행 패널 문구는 데이터로 빼서 아코디언 컴포넌트가 도메인을 몰라도 되게 한다 */
const rows: MeRow[] = [
  { icon: 'search', label: '최근 본 쇼츠', panel: '최근 7일간의 학습 기록이에요' },
  { icon: 'bookmark', label: '오답 노트', hint: '3', panel: '최근 7일간의 학습 기록이에요' },
  { icon: 'mic', label: '내 학습 통계', panel: '최근 7일간의 학습 기록이에요' },
  { icon: 'heart', label: '좋아요한 쇼츠', panel: '좋아요한 쇼츠 0개가 있어요' },
  { icon: 'more', label: '설정', panel: '알림 · 자막 · 데이터 관리' },
];

export function MeScreen() {
  const navigate = useNavigate();
  const { likedList, toast } = useStore();
  const { signOut, status } = useAuth();

  const onLogout = () => {
    /* 로그인 상태일 때만 쿠키를 지운다 — 서버에 세션이 없는데 지우러 갈 이유가 없다 */
    if (status === 'authed') {
      signOut();
      toast('로그아웃했어요');
    }
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="screen me">
      <TopBar title="마이" back={false} />

      <div className="me__scroll">
        <MeProfile
          name="공공이"
          tagline="오늘도 3분, 이어가 볼까요"
          onEdit={() => toast('프로필 편집은 준비 중이에요')}
        />

        <MeStats stats={STATS} />

        <MeGoalCard
          done={4}
          goal={5}
          goalPercent={80}
          note="한 번만 더 하면 주간 목표를 채워요"
        />

        <MeRows
          rows={rows.map((r) =>
            r.label === '좋아요한 쇼츠' ? { ...r, panel: `좋아요한 쇼츠 ${likedList.length}개가 있어요` } : r,
          )}
          onOpen={(label) => {
            if (label === '좋아요한 쇼츠') toast(`좋아요한 쇼츠 ${likedList.length}개`);
          }}
        />

        <button type="button" className="me__logout t-label" onClick={onLogout}>
          {status === 'authed' ? '로그아웃' : '로그인하러 가기'}
        </button>
      </div>
      <TabBar />
    </div>
  );
}
