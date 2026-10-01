export type OnboardingPage = {
  /** 단계별 일러스트 경로 */
  image: string;
  /** 큰 타이틀 줄 (두 번째 줄은 강조색) */
  lines: readonly [string, string];
  /** 보조 설명 줄 */
  desc: readonly [string, string];
};

export const ONBOARDING_PAGES: readonly OnboardingPage[] = [
  {
    image: '/assets/onboarding/01_short_30sec.png',
    lines: ['하루 10분,', '30초씩 끝낸다'],
    desc: ['쇼츠 한 편과 3문항,', '오늘 공부할 만큼만 딱.'],
  },
  {
    image: '/assets/onboarding/02_watch_and_quiz.png',
    lines: ['짧게 보고,', '바로 확인'],
    desc: ['긴 설명을 30초로 보고', '바로 3문항으로 확인해요.'],
  },
  {
    image: '/assets/onboarding/03_daily_progress.png',
    lines: ['매일 쌓이는', '공부'],
    desc: ['오늘 한 만큼 기록하고,', '다음 공부로 이어가요.'],
  },
];
