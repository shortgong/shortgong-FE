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
- 피드: 목록 API 가 없어 `1~15` 를 병렬로 훑고 `COMPLETED + draft 있음` 만 남긴다(실측존재: 1, 2, 9, 14).
  랜덤 선택은 `queryFn` 안에서 일어나므로 리렌더마다 바뀌지 않는다. 찾은 id 는
  `localStorage.shortgong.feed.ids` 에 기억해 다음 로드에서 404 storms(요청 11개 + 콘솔 404 11개)를 없앤다.
  단 '빈 배열'은 '못 찾음'이므로 다시 훑는다 — 서버에 나중에 생긴 영상을 놓치지 않기 위해.
- `WatchScreen` 의 모든 iframe 은 `serverHtml ?? s.html` 을 그린다 — 하나만 실물로 뛰면
  백엔드 문서가 깨진 건지 앱이 깨진 건지 구분할 수 없기 때문.

## Pending/Next
- **백엔드 CORS 는 백엔드에서 처리하기로 했다.** FE 는 프록시를 쓰지 않고
  `http://localhost:8080` 을 직접 때린다 (`VITE_API_BASE=http://localhost:8080`).
  - 현재 상태로는 브라우저가 전부 막는다 — 실측:
    `Access to fetch at 'http://localhost:8080/api/video/1' from origin
    'http://localhost:5199' has been blocked by CORS policy`.
  - 필요조건: `http://localhost:5199` 을 allowOrigins 에 넣고 `allowCredentials(true)`.
    refreshToken 이 HttpOnly cookie 라 credentials 가 false 면 refresh/로그아웃이 조용히 실패한다.
  - `Authorization` 헤더를 쓰므로 preflight 를 통과해야 한다 (`allowedHeaders` 포함).
- **피드 스캔은 로그인 상태에서만 돈다.** `GET /api/video/{id}` 는 컨트롤러에 `@CurrentUserId` 가
  없지만 `SecurityConfig.anyRequest().authenticated()` 때문에 실측 401 이다. 인증은 유지하기로 했다.
  - `useRandomServerShort` 은 `enabled: !!getAccessToken()` — 익명이면 훑지 않는다.
  - 목록 API 가 없다. `GET /api/video` 는 존재하지 않고 `/{videoId}` 뿐이라
    1~15 를 병렬로 찔러야 한다. 없는 id 는 `VIDEO_NOT_FOUND(404)` 로 온다 — `ErrorCode.java:19`.
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