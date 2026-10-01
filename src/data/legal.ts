/**
 * 약관 문서 본문.
 * sections[].body 는 문단 배열 — 한 항목이 화면에서 한 문단으로 렌더됩니다.
 * TODO 표시된 항목을 실제 문구로 교체하세요.
 */

export type LegalSlug = 'terms' | 'privacy';

export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  /** 화면 상단에 노출되는 시행일. 형식: '2026. 10. 01.' */
  effective: string;
  intro: string;
  sections: LegalSection[];
};

const FILL = '(작성 필요)';

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: '이용약관',
    effective: '2026. 10. 01.',
    intro: `${FILL} 숏공 서비스 이용에 관한 사항을 정합니다.`,
    sections: [
      {
        heading: '1. 약관의 적용',
        body: [FILL],
      },
      {
        heading: '2. 이용 자격',
        body: [FILL],
      },
      {
        heading: '3. 계정 관리',
        body: [FILL],
      },
      {
        heading: '4. 학습 콘텐츠와 학습 기록',
        body: [FILL],
      },
      {
        heading: '5. 이용자의 의무',
        body: [FILL],
      },
      {
        heading: '6. 서비스의 변경과 중단',
        body: [FILL],
      },
      {
        heading: '7. 면책 책임',
        body: [FILL],
      },
      {
        heading: '8. 개인정보 처리',
        body: [FILL, '개인정보의 수집·이용·보관 및 파기는 개인정보처리방침에 따릅니다.'],
      },
      {
        heading: '9. 준용법과 관할',
        body: [FILL],
      },
      {
        heading: '10. 약관의 변경',
        body: [FILL],
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: '개인정보처리방침',
    effective: '2026. 10. 01.',
    intro: `${FILL} 숏공은 이용자의 개인정보를 안전하게 처리합니다.`,
    sections: [
      {
        heading: '1. 개인정보 처리 원칙',
        body: [FILL],
      },
      {
        heading: '2. 수집하는 개인정보 항목',
        body: [FILL],
      },
      {
        heading: '3. 개인정보의 이용 목적',
        body: [FILL],
      },
      {
        heading: '4. 보유 및 이용 기간',
        body: [FILL],
      },
      {
        heading: '5. 개인정보의 제3자 제공 및 처리 위탁',
        body: [FILL],
      },
      {
        heading: '6. 정보의 파기',
        body: [FILL],
      },
      {
        heading: '7. 개인정보의 안전성 확보',
        body: [FILL],
      },
      {
        heading: '8. 이용자의 권리와 방법',
        body: [FILL],
      },
      {
        heading: '9. 만 14세 미만 이용자의 보호',
        body: [FILL],
      },
      {
        heading: '10. 개인정보 관리 담당자 및 연락처',
        body: [FILL],
      },
    ],
  },
};

export const isLegalSlug = (v: string | undefined): v is LegalSlug => v === 'terms' || v === 'privacy';
