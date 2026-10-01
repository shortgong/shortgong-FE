# 숏공 (shortgong-FE)

60초 쇼츠로 배우고, 바로 테스트까지. 학습 세트를 순서대로 감상한 뒤 문항으로 체크하는 모바일 웹 프론트엔드입니다.

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 빌드 | Vite 8 |
| UI | React 19 + TypeScript (strict) |
| 라우팅 | react-router-dom 7 |
| 스타일 | 순수 CSS (CSS 변수 토큰) |
| 린트 | oxlint |
| 폰트 | Pretendard Variable |

## 시작하기

```bash
npm install
npm run dev      # 개발 서버 ( 기본 http://localhost:5173 )
npm run build    # 타입 체크 후 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## 브랜치 전략

| 브랜치 | 역할 |
| --- | --- |
| `main` | 릴레이브. 툴체인·토큰 등 프로젝트 기초 세팅만 담는다. |
| `develop` | 통합 브랜치. 앱 골격과 모든 페이지가 모인다. |
| `publish/<페이지>` | 페이지 단위 작업 브랜치. `develop` 으로 PR 을 올리고 머지한다. |

페이지 작업은 `publish/<페이지>` 브랜치에서 진행하고, 리뷰가 끝나면 `develop` 에 머지합니다.
`develop` 은 기능이 모이는 통합 지점이므로 직접 커밋하지 않습니다.

## 폴더 구조

```
src/
  components/   공용 UI (아이콘, 버튼, 상단바, 탭바, 리스트 등)
  data/         도메인 타입과 목데이터
  hooks/        화면 단위 훅
  screens/      라우트에 매핑되는 페이지
  store/        전역 상태와 localStorage 영속화
  styles/       디자인 토큰과 전역 스타일
```

## 디자인 규칙

- 색상·타이포·간격은 모두 `src/styles/tokens.css` 의 CSS 변수를 사용한다.
- 본문 텍스트는 `--c-ink-muted` 이상 대비를 확보한다. `--c-ink-faint` 는 보조 메타에만 쓴다.
- 모바일 320px ~ 430px 범위를 항상 확인한다. 가로 스크롤은 의도한 경우에만 허용한다.
- 모션은 `prefers-reduced-motion` 을 존중한다.
