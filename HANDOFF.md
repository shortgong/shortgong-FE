# HANDOFF

## Current State
- Branch: `fix/embed-swipe-tts` (develop `dc0377f` 기준)
- Typecheck/lint/build: PASS. 회귀 11종 + `ttscheck` 31/31 + `embedcheck` 39/39 통과.
- 임베드: 피트 문서는 320×640 / 360×780 / 390×844 / 430×932 전부 안 잘림.
- 인증: Google OAuth → 백엔드 콜백 → FE `/oauth/callback?key=` → exchange → accessToken(localStorage).
- 쇼츠 생성: `POST /api/video` → `PROCESSING` 면 `GET /api/video/{id}` 폴링 → `COMPLETED` 면 `draft`(임베드 HTML)로 렌더. 예전 타이머 흉내는 걷어냈다.
- `MeScreen` 로그아웃이 `DELETE /api/auth/logout` 을 실제로 호출한다(쿠키가 안 지워지면 다음 방문에 되살아난다).

## Decisions
- JS required for TTS → sandbox `allow-scripts`, CSP is defense (no allow-same-origin).
- Autoplay via `allow="autoplay"` (not sandbox token).
- **Swipe: `pointer-events: none` 은 제거했다.** iframe 안의 스크롤 문서가 내부에서 스크롤해야 해서
  막으면 조작이 죽는다. 피트(fit) 문서는 `overflow: hidden` 이라 터치가 문서를 통과해
  부모 스와이프로 체이닝된다 — 그래서 '피트 ↔ 스와이프'는 피트 규칙이 지키는 관계지
  pointer-events 가 아니다. 넘치는(스크롤) iframe 은 당연히 스와이프를 막는다.
- TALL 문서는 저uya 알아서 줄어들게 반응형(16항목 + `clamp()`/`vh`) 으로 작성.
- TTS 문서에는 `#b` 다시 듣기 버튼이 있다 — 사내에서 대화형 문서가 동작함을 확인하는 지점.
- 인증: accessToken 은 `localStorage['shortgong.accessToken']`. 새로고침해도 로그인이 유지된다
  (대가는 "페이지를 읽을 수 있는 스크립트는 토큰도 읽는다" — 감수한 선택).
  refreshToken 은 여전히 HttpOnly 라 FE 가 저장하지 않는다 — 백엔드 `Set-Cookie` 가 유일한 원천.
- 토큰이 없으면 `useMe` 이 disabled 라 백엔드에 아예 묻지 않는다 — 익명 방문자는 API 호출 0회.
  죽은 토큰은 `apiFetch` 가 401 → `token/refresh` → 1회 재시도로 되살린다(동시 요청은 single-flight).
- 서버 상태는 react-query 로 모았다(`src/api/queries.ts`). 기본 staleTime 1m / gcTime 5m / retry 1,
  mutation 은 retry 0(생성은 되돌릴 수 없다). 회원은 5분, 쇼츠는 PROCESSING 동안 staleTime 0.
- 폴링은 `refetchInterval` 이 담당한다 — 상태가 확정되거나 상한에 닿으면 `false` 를 돌려주고,
  언마운트 시 요청도 함께 끊긴다. 진행률은 폴링 횟수에서 파생한다(상태로 들고가지 않는다).
- 캐시는 메모리다 — 전체 리로드엔 항상 다시 조회한다. SPA 내 이동만 히트난다.

## Pending/Next
- **백엔드 CORS 가 아직 없다.** `Access-Control-Allow-*` 헤더가 하나도 없어 cross-origin 호출이 전부 막힌다.
  - 지금은 `.env.local`의 `VITE_API_BASE=` (vite 프록시, 같은 출처)로 우회 중 — 코드는 상대경로로 나가 8080 으로 전달된다.
  - 백엔드에 CORS 를 넣으면 `.env.local` 을 지운다(수정 0줄).
- 백엔드가 로그인 성공 후 `http://localhost:5199/oauth/callback?key=<교환 토큰>` 으로 리다이렉트 하는지 확인 필요.
- `POST /api/video` 로 실제 업로드 연동은 아직 안 건드렸다.
- Playwright 체크는 `/tmp/opencode/*.mjs`, 리포에 포함되지 않는 임시 파일이다.

## Quick Start
```bash
cd /home/user/Desktop/workspace/shortgong/shortgong-FE
npm run dev            # localhost:5199 (127.0.0.1 로 열면 쿠키가 안 넘어간다)
cd /tmp/opencode && node oauthe2e.mjs node oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjsnode oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjs node meauthcheck.mjs node oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjsnode oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjs node createcheck.mjs node oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjsnode oauthe2e.mjs && node createcheck.mjs && node logoutcheck.mjs && node allroutes.mjs node logoutcheck.mjs && node allroutes.mjs
# embedcheck/ttscheck 는 stdout 이 아니라 embedcheck.out 파일에 쓴다
```