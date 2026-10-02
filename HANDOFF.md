# HANDOFF

## Current State
- Branch: `fix/embed-swipe-tts` (develop `dc0377f` 기준)
- Typecheck/lint/build: PASS. 회귀 11종 + `ttscheck` 31/31 + `embedcheck` 39/39 통과.
- 임베드: 피트 문서는 320×640 / 360×780 / 390×844 / 430×932 전부 안 잘림.
- 인증: Google OAuth → 백엔드 콜백 → FE `/oauth/callback?key=` → exchange → accessToken(메모리).

## Decisions
- JS required for TTS → sandbox `allow-scripts`, CSP is defense (no allow-same-origin).
- Autoplay via `allow="autoplay"` (not sandbox token).
- **Swipe: `pointer-events: none` 은 제거했다.** iframe 안의 스크롤 문서가 내부에서 스크롤해야 해서
  막으면 조작이 죽는다. 피트(fit) 문서는 `overflow: hidden` 이라 터치가 문서를 통과해
  부모 스와이프로 체이닝된다 — 그래서 '피트 ↔ 스와이프'는 피트 규칙이 지키는 관계지
  pointer-events 가 아니다. 넘치는(스크롤) iframe 은 당연히 스와이프를 막는다.
- TALL 문서는 저uya 알아서 줄어들게 반응형(16항목 + `clamp()`/`vh`) 으로 작성.
- TTS 문서에는 `#b` 다시 듣기 버튼이 있다 — 사내에서 대화형 문서가 동작함을 확인하는 지점.
- 인증: accessToken 은 메모리만. 새로고침은 `POST /api/auth/token/refresh`(refreshToken 쿠키)로 되살린다.
  refreshToken 은 HttpOnly 라 FE 가 저장하지 않는다 — 백엔드 `Set-Cookie` 가 유일한 원천.
- 로그인 여부 표지(`localStorage.shortgong.session`)가 없으면 백엔드에 묻지 않는다 —
  익명 방문자가 매 로드마다 403 을 받고 콘솔이 더러워진다.

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
cd /tmp/opencode && node oauthe2e.mjs && node embedcheck.mjs && node allroutes.mjs
```