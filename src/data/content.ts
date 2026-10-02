import { EMBED_DOCS, buildEmbedDoc } from './embedDocs';
import { EMBED_CSP } from '../embed/embedPolicy';
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
  /**
   * 인제스트가 새티타이즈하고 CSP 를 주입해 내려준 self-contained HTML.
   * 없으면 쇼츠는 배경 그라디언트만 보여준다. src/embed/embedPolicy.ts 참고.
   */
  html?: string;
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
    html: buildEmbedDoc(EMBED_DOCS.tts, EMBED_CSP),
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
    html: buildEmbedDoc(EMBED_DOCS.card, EMBED_CSP),
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
    html: buildEmbedDoc(EMBED_DOCS.stat, EMBED_CSP),
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
    html: buildEmbedDoc(EMBED_DOCS.tall, EMBED_CSP),
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
export type Question = {
  id: string;
  /** 이 문제를 풀 수 있는 학습 세트 (퀴즈는 세트에서만 진입 가능) */
  setId: string;
  kind: 'choice' | 'text';
  prompt: string;
  choices?: { id: string; label: string }[];
  answer: string;
  accepted: string[];
  hint: string;
};

export const QUESTIONS: Question[] = [
  {
    id: 'q-science-1',
    setId: 'set-science',
    kind: 'choice',
    prompt: '세포 소기관 편 봤어요. 광합성이 일어나는 소기관은?',
    choices: [
      { id: '1', label: '미토콘드리아' },
      { id: '2', label: '엽록체' },
      { id: '3', label: '리보솜' },
      { id: '4', label: '핵' },
    ],
    answer: '2',
    accepted: ['2'],
    hint: '광합성이 일어나는 세포 소기관은?',
  },
  {
    id: 'q-science-2',
    setId: 'set-science',
    kind: 'text',
    prompt: '2번째 편이에요. 세포호흡이 일어나는 소기관의 이름을 적어주세요.',
    answer: '미토콘드리아',
    accepted: ['미토콘드리아', '마이토콘드리아', 'mitochondria'],
    hint: '세포 호흡이 일어나는 장소',
  },
  {
    id: 'q-science-3',
    setId: 'set-science',
    kind: 'text',
    prompt: '마지막 문제예요. 단백질을 합성하는 구조물은 무엇일까요?',
    answer: '리보솜',
    accepted: ['리보솜', '리보좀', '리보소마', 'ribosome'],
    hint: '단백질을 합성하는 곳',
  },
  {
    id: 'q-derivative-1',
    setId: 'set-derivative',
    kind: 'choice',
    prompt: '함수 그 자체를 다루는 학문의 이름은?',
    choices: [
      { id: '1', label: '미적분학' },
      { id: '2', label: '대수학' },
      { id: '3', label: '위상수학' },
    ],
    answer: '1',
    accepted: ['1'],
    hint: '함수의 변화율을 다루는 학문',
  },
  {
    id: 'q-derivative-2',
    setId: 'set-derivative',
    kind: 'text',
    prompt: '함수의 순간 변화율을 뜻하는 단어는?',
    answer: '도함수',
    accepted: ['도함수', '미분계수', 'derivative'],
    hint: '변화율 그 자체',
  },
  {
    id: 'q-derivative-3',
    setId: 'set-derivative',
    kind: 'choice',
    prompt: '극한값을 이용해 면적을 구하는 방법이야, 뜻하는 영어 단어는?',
    choices: [
      { id: '1', label: 'Integral' },
      { id: '2', label: 'Derivative' },
      { id: '3', label: 'Matrix' },
    ],
    answer: '1',
    accepted: ['1'],
    hint: '누적해서 넓이를 구하는 방법',
  },
  {
    id: 'q-toeic-1',
    setId: 'set-toeic',
    kind: 'choice',
    prompt: '빈출 단어 중 "기회, 기회" 뜻은?',
    choices: [
      { id: '1', label: 'opportunity' },
      { id: '2', label: 'occasion' },
      { id: '3', label: 'chance' },
    ],
    answer: '1',
    accepted: ['1'],
    hint: '기회 (형용사형 opportunities)',
  },
  {
    id: 'q-toeic-2',
    setId: 'set-toeic',
    kind: 'text',
    prompt: '"반대, 대척" 뜻하는 단어를 적어주세요.',
    answer: 'contrast',
    accepted: ['contrast', 'contrary', '대조'],
    hint: '반대',
  },
  {
    id: 'q-toeic-3',
    setId: 'set-toeic',
    kind: 'choice',
    prompt: '"명확히, 분명히" 에 가장 가까운 단어는?',
    choices: [
      { id: '1', label: 'obvious' },
      { id: '2', label: 'actual' },
      { id: '3', label: 'various' },
    ],
    answer: '1',
    accepted: ['1'],
    hint: '분명히',
  },
];

export const questionsOfSet = (setId: string) => QUESTIONS.filter((q) => q.setId === setId);

export const DAILY_TIPS = [
  { title: '오늘의 학습 팁', body: '하루 3분씩 이어보면 기억에 오래 남아요' },
  { title: '복습 타이밍', body: '배운 날로부터 1일, 3일, 7일 뒤에 다시 보면 체감이 커요' },
  { title: '잘못 외우는 법', body: '오답은 지우지 말고 다시 읽어야 다음번에 안 틀려요' },
  { title: '속도 조절', body: '처음엔 1.25배로 천천히, 익숙해지면 2배로 올려보세요' },
];

export const fmtSec = (s: number) => `${Math.floor(s / 60)}분`;
export const fmtCount = (n: number) =>
  n >= 10000 ? `${(n / 1000).toFixed(1)}만` : n >= 1000 ? `${(n / 1000).toFixed(1)}천` : String(n);
