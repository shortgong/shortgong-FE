export type Short = {
  id: string;
  title: string;
  channel: string;
  tag: string;
  lesson: number;
  totalLessons: number;
  seconds: number;
  topic: string;
  tone: 'mint' | 'sand' | 'lilac' | 'sky';
  liked: boolean;
  likes: number;
  createdAgo: string;
  watched: boolean;
};

export const SHORTS: Short[] = [
  {
    id: 's1',
    title: '수학 미적분 개념 정리',
    channel: '수학 한 수',
    tag: '3분 개념정리',
    lesson: 5,
    totalLessons: 12,
    seconds: 180,
    topic: '미적분학',
    tone: 'mint',
    liked: false,
    likes: 1240,
    createdAgo: '3분 전',
    watched: true,
  },
  {
    id: 's2',
    title: '토익 필수 단어 100',
    channel: '영어 하루',
    tag: '4분 강의',
    lesson: 10,
    totalLessons: 10,
    seconds: 240,
    topic: '토익',
    tone: 'sand',
    liked: true,
    likes: 843,
    createdAgo: '어제',
    watched: true,
  },
  {
    id: 's3',
    title: '과학 화학 반응식',
    channel: '생물 노트',
    tag: '2분 정리',
    lesson: 2,
    totalLessons: 9,
    seconds: 120,
    topic: '과학',
    tone: 'lilac',
    liked: false,
    likes: 612,
    createdAgo: '3일 전',
    watched: false,
  },
  {
    id: 's4',
    title: '평균과 중앙값, 언제 무엇을 쓸까',
    channel: '데이터 기초 연구소',
    tag: '3분 개념정리',
    lesson: 1,
    totalLessons: 8,
    seconds: 180,
    topic: '통계',
    tone: 'sky',
    liked: true,
    likes: 1200,
    createdAgo: '1주 전',
    watched: true,
  },
  {
    id: 's5',
    title: '미적분, 도함수란 무엇인가',
    channel: '수학 한 수',
    tag: '2분 정리',
    lesson: 4,
    totalLessons: 12,
    seconds: 120,
    topic: '미적분학',
    tone: 'mint',
    liked: false,
    likes: 431,
    createdAgo: '1주 전',
    watched: false,
  },
  {
    id: 's6',
    title: '세포 소기관 구조 총정리',
    channel: '생물 노트',
    tag: '4분 강의',
    lesson: 2,
    totalLessons: 9,
    seconds: 240,
    topic: '과학',
    tone: 'lilac',
    liked: false,
    likes: 2100,
    createdAgo: '2주 전',
    watched: true,
  },
  {
    id: 's7',
    title: '토픽 동사, 이것만 기억하세요',
    channel: '영어 하루',
    tag: '3분 정리',
    lesson: 3,
    totalLessons: 10,
    seconds: 180,
    topic: '토익',
    tone: 'sand',
    liked: false,
    likes: 512,
    createdAgo: '3주 전',
    watched: false,
  },
];

export const TOPICS = ['미적분학', '토익', '과학', '통계', '역사', '경제', '프로그래밍', '생물'] as const;

/* ---------------- 학습 세트 (재생목록) ---------------- */
export type StudySet = {
  id: string;
  title: string;
  /** 세트 한 줄 설명 */
  desc: string;
  /** 탐색 필터용 토픽 */
  topic: (typeof TOPICS)[number];
  /** 세트에 포함된 쇼츠 id (순서가 곧 학습 순서) */
  shortIds: string[];
  /** 마지막 편 감상 후 노출할 퀴즈 CTA 문구 */
  quizCta: string;
  /** 표지 색조 — 토큰과 함께 세트를 구분해 준다 */
  coverTone: Short['tone'];
  /** 난이도 */
  level: '입문' | '기초' | '심화';
};

export const STUDY_SETS: StudySet[] = [
  {
    id: 'set-derivative',
    topic: '미적분학',
    title: '미적분, 이것만',
    desc: '도함수 개념부터 통계까지 3편',
    shortIds: ['s1', 's5', 's4'],
    quizCta: '미적분 세트 문제 3개 풀기',
    coverTone: 'mint',
    level: '심화',
  },
  {
    id: 'set-toeic',
    topic: '토익',
    title: '토익 빈출 정리',
    desc: '필수 단어와 토픽 동사 2편',
    shortIds: ['s2', 's7'],
    quizCta: '토익 세트 문제 3개 풀기',
    coverTone: 'sand',
    level: '기초',
  },
  {
    id: 'set-science',
    topic: '과학',
    title: '과학 개념 총정리',
    desc: '화학 반응식부터 세포 소기관까지 2편',
    shortIds: ['s3', 's6'],
    quizCta: '과학 세트 문제 3개 풀기',
    coverTone: 'lilac',
    level: '입문',
  },
];

export const findSet = (id: string | undefined) => STUDY_SETS.find((s) => s.id === id);

export const secondsOfSet = (set: StudySet) => shortsOfSet(set).reduce((n, s) => n + s.seconds, 0);

export const shortsOfSet = (set: StudySet) =>
  set.shortIds.map((id) => SHORTS.find((s) => s.id === id)).filter((s): s is Short => Boolean(s));

/** 세트 진행률 0~1 */
