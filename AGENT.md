# AGENT.md

## Project
ShortGong FE — React + Vite + TypeScript. Mobile-first PWA.

## Core Rules
- NEVER commit changes unless user explicitly asks.
- Before editing: read surrounding context (imports, patterns, tokens). Mimic style.
- No comments unless asked.
- Keep outputs < 4 lines (unless detail requested). Answer concisely.

## Build/Test/Lint
- `npm run dev` (Vite, port 5199)
- `npm run build`, `tsc -b --noEmit`, `npm run lint` (oxlint)
- E2E checks: Node + Playwright (`/tmp/opencode/*.mjs`) — run from `/tmp/opencode`.
- Regression: `node sets.mjs swipe.mjs overlap.mjs lastslide.mjs allroutes.mjs explorecheck.mjs mecheck.mjs createcheck.mjs legalcheck.mjs toptxt.mjs` (as needed)

## Short Embed (Critical)
- Ingest gives self-contained HTML. Render via `srcDoc` only.
- Sandbox: `allow-scripts` only. NEVER `allow-same-origin` with `allow-scripts`. `allow="autoplay"`.
- CSP injected by ingest (frontend must not override). `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'; navigate-to 'none'`.
- Fit: embed HTML must respect `box-sizing: border-box`, prefer `overflow: hidden`, avoid 100% height + padding causing scroll.
- Swipes: NEVER put `pointer-events: none` on the iframe — it kills interaction inside the doc. A FIT doc (`overflow: hidden`) chains touch to the parent, so swipe works *because* it fits; an overflowing (scrollable) iframe legitimately blocks swipe.
- CTA ("눌러서 보기") lives inside iframe HTML (not parent). No play button in parent.
- Mount: iframe renders immediately when HTML present (no first-gesture gate in parent).

## Auth (Google OAuth)
- Login is a **full-page redirect**, never a popup/XHR (Google blocks framed login): `location.assign(OAUTH_GOOGLE_URL)` → backend `/oauth2/authorization/google`. Backend owns the Google callback and the PKCE/state.
- Backend then redirects to FE **`/oauth/callback?key=<one-time exchange token>`**. `OAuthCallbackScreen` exchanges it once, strips the key from the URL, then goes to `/home`.
- `accessToken` lives in `localStorage['shortgong.accessToken']` (`src/api/client.ts`) so a reload does not force a re-login. The cost is accepted deliberately: any script that can read the page can read the token.
- `refreshToken` is HttpOnly — the backend sets it. FE only sends it via `credentials: 'include'`. FE must never try to write it.
- No session hint anymore: the token itself is the flag. No token → `useMe` is `disabled` → anonymous visitors make **zero** API calls.
- A dead token is handled in `apiFetch`: 401 → `POST /api/auth/token/refresh` (single-flight, so a rotating refresh token is never raced) → retry once → otherwise drop the token and surface `ApiError(401)`.
- `AUTH_ORIGIN` (absolute) is separate from `API_BASE` — OAuth navigation must never become a relative path, or it lands back in the SPA and gets swallowed by the catch-all route.

## Server state (react-query)
- One `QueryClient` (`src/api/queryClient.ts`) mounted in `main.tsx`. Every server read goes through `src/api/queries.ts` — no hand-rolled `useEffect` fetching.
- Defaults: `staleTime` 1m, `gcTime` 5m, `retry` 1 for queries, **`retry` 0 for mutations**, `refetchOnWindowFocus` off. Mutations are not idempotent — a retried create makes a second shorts.
- Per-query overrides: member `staleTime` 5m; a video is `staleTime` 0 while `PROCESSING` and 5m once `COMPLETED`.
- Polling belongs to `refetchInterval`, never to a timer in an effect: `useVideo` returns `false` from it once the status settles or the poll cap is hit, which stops the requests and frees cancellation on unmount.
- `pct` is **derived**, not stored: it is computed from the poll count, so there is no state to fall out of sync with the query.
- Logout calls `queryClient.clear()` — otherwise the previous member/video stays cached and flashes for the next person who logs in.
- Cache is in memory, so a hard reload always refetches. Only SPA navigation can be a cache hit; do not write tests that expect otherwise.

## 임베드 수명주기 (발화 정지)
- TTS 는 iframe **안**에서 돈다. `sandbox` 에 `allow-same-origin` 이 없어 문서 오리진이 불투명하므로
  부모는 `iframe.contentWindow.speechSynthesis` 에 손대지 못한다. → 자식 안에서만 멈출 수 있다.
- 그래서 `ShortEmbed` 가 `withLifecycle(html)` 로 문서 머리에 가드를 주입한다.
  `pagehide`/`unload` 에서 `speechSynthesis.cancel()` 하고 **`speak` 를 무음으로 바꾼다**.
  - cancel 만으로는 부족하다. author 가 `utterance.onend → playScene(next)` 로 발화를 이어 붙이는데,
    취소된 발화에도 Chrome 은 onend 를 쏜다 → 곧바로 다음 발화가 다시 큐에 오른다.
    그 발화는 이미 버려진 문서의 것이므로 마비가 안 되고, 사용자가 다른 화면으로 갔는데도 말이 계속된다.
  - `speak` 를 막아야 재예약이 통과하지 못한다. cancel **뒤에** 막아야 한다(onend 가 비동기).
- ★ 비활성 슬라이드는 iframe 을 아예 마운트하지 않는다. 되살릴 방법이 없으니 없애는 게 유일한 방법이고,
  슬라이드마다 상태가 새지 않는다. 보이는 건 활성 한 장뿐이라 화면 변화는 없다.
- 주입 위치는 `<head>` 안쪽(없으면 `<html>`, `<body>`, 최후 prepend) — 맨 앞에 넣으면
  doctype 이 밀려 quirks 모드가 된다.
- 막은 것은 그 문서뿐이다. 새로 마운트된 iframe 의 `speak` 는 살아 있다(회귀 테스트로 확인).

## Feed (목록 API 가 없을 때)
- There is no list endpoint. `videos.KNOWN_VIDEO_IDS` holds the ids that are known to exist — currently `1, 2, 9, 14`. `useRandomServerShort()` picks one at random and fetches **that one**. Do not rescan a range: probing ids that do not exist just produces 404s.
- `content` is the self-contained HTML document and is what goes into `ShortEmbed`'s `srcDoc` (after `withLifecycle`). **`draft` is the plain-text transcript** — putting it in an iframe renders a wall of text, which is the bug this rule exists to prevent.
- The pick is random but **stable**: it happens inside `queryFn`, so re-renders do not reshuffle. `invalidateQueries({ queryKey: qk.feed })` rerolls.
- Every `ShortEmbed` in `WatchScreen` renders `serverVideo?.content ?? s.html`, so one real video fills every slide. Deliberate: if one card renders it and the others do not, you cannot tell whether the backend document is broken or the app is.
- The query is `enabled: !!getAccessToken()` — `GET /api/video/{id}` answers 401 (see HANDOFF), so an anonymous visitor never scans and falls back to the local sample shorts.

## Video API
- `POST /api/video` body is `{ content: string }` (≤10000 chars) → `{ id, status }`. Ingest is async: `PROCESSING` means the HTML is not ready yet.
- `useMakingProgress` follows it for real: POST, then poll `GET /api/video/{id}` every 1.5s until `COMPLETED`/`FAILED`. `done`/`failed` must come from the response — never from a timer.
- `pct` is not reported by the backend. The tick toward 99% is decoration only; 100 is printed once the response settles.
- `VideoResponse.draft` holds the ingest output (self-contained HTML) → `ShortEmbed` `srcDoc`. If `draft` is empty, render nothing (`toShort` maps it to `undefined`).
- `WatchScreen?video=<id>` renders exactly one server video. Everything else stays on mock data — there is no list endpoint yet.
- Creating needs a token, but the screen stays reachable: an anonymous submit routes to `/onboarding`. Never let a raw 401 reach the UI.
- Cancel with `liveRef`, not a cleared timer — an in-flight poll must not resurrect a reset screen.

## Data
- `src/data/content.ts`: study sets, shorts, questions. `Short.html?` holds embed HTML for that short.
- `src/data/embedDocs.ts`: mock embed HTML (CARD/STAT/TALL/TTS). TTS uses ko-KR SpeechSynthesis with `onstart/onend/onerror` logging to `#s`.

## Verification
- Run tsc/lint/build. Run relevant Playwright checks in `/tmp/opencode/`. All must pass before push.

## github
- 매번 커밋 할 것. 브랜치 나누는 거 할 것, 머지할 것 등등

## 세트가 유일한 감상 단위 (쇼츠 단독 감상 없음)
- 쇼츠를 따로 보는 길은 없다. `WatchScreen` 은 **세트로만** 들어온다.
  - `?set=<id>` — 학습 세트. 유일한 정상 진입.
  - `?video=<id>` — 방금 만든 세트의 1편 미리보기. 생성 직후 CTA 로만 쓰인다.
  - 세트 파라미터 없이 `/watch` 로 오면 `/explore` 로 되돌려 보낸다 (`replace`).
- 옛 일반 피드(`state.shorts`)와 `?at=<id>` 딥링크는 **삭제했다**.
  `useShortScroller` 의 `deepIndex` 인자도 함께 없어졌다 — 딥링크 전용이라 남기면 죽은 코드.
-首页 탐색·홈의 진입점은 전부 `/watch?set=<id>` 다. 쇼츠 id 로 곧장 `/watch` 로 보내지 않는다.

## 세트 표지는 9:16 (세로 포스터)
- **세트 표지는 어디서 보든 9:16 이다.** `SetCard`(탐색) · `SetRail`(홈 인기 세트) · `SetLine` 모두 `aspect-ratio: 9/16`.
- 구조가 갈린다:
  - `SetCard` — 세로 카드가 아니라 **가로 카드**. 9:16 표지를 왼쪽에 두고 본문을 오른쪽에 붙인다
    (세로 카드로 두면 표지가 폭을 먹어 카드가 세로로 길게 늘어나 화면을 다 삼킨다).
  - `SetRail` — 타일 폭 122px, 표지 약 122x217. 가로 레일이라 스크롤로 넘긴다.
  - `SetLine` — 폭 45px짜리 작은 포스터. 목록 행 안에서 존재감만 준다.
- 표지는 단색 블록(`coverTone`)이라 비율만 맞으면 된다. 이미지가 들어오면 `object-fit` 를 함께 정할 것.

## 홈 화면
- 인사말 헤더(`안녕하세요` / `무엇을 배워볼까요`)는 **삭제**했다. 첫 화면은 검색창으로 시작한다.
- AI 추천 성격의 대표 세트 블록(`home__feature`)도 삭제했다.
- 홈 구성: 검색(+최근 검색) → **인기 세트 레일** → 다른 세트 → 채널 → 학습 팁 → 세트 만들기.
- 인기 세트 레일과 '다른 세트' 목록이 **같은 세트를 두 번 보여주지 않게** 나눈다.
  `SET_RAIL_COUNT`(6) 만큼은 레일이 차지하고, 그 나머지만 목록으로 내려간다.
  세트가 6개 이하면 목록은 비어 비로소 사라진다 — 목데이터 3개라 지금은 안 보인다.
- 인기 정렬 기준은 세트 길이(문제 수) 내림차순 (`popularSets()`). 목데이터라 숫자를 새로 만들지 않는다.

## 생성 화면 — 텍스트 하나뿐
- 입력 수단은 **텍스트 단 하나**. 분야/카테고리 칩과 자료 첨부(`CreateAttach`)는 **삭제**했다.
  선택지를 주면 무엇을 만들어야 할지 고민하게 되고, 고른 값이 품질을 못 받으면 원망만 샌다.
- 예시 칩은 남겨 둔다 — 선택지가 아니라 작성창에 **텍스트를 채워 넣는 지름길**이므로 같은 입력 수단이다.
- 생성물은 쇼츠가 아니라 **세트**다: 타이틀 `세트 생성`, CTA `세트 만들기`, 완료 토스트 `세트를 만들었어요`,
  완료 후 CTA `만든 세트 바로 보기` (`/watch?video=<id>`).

## 마이페이지
- 한 줄 소개(태그라인)와 `편집` 버튼은 **삭제**했다. 백엔드에 편집 API 도 없다.
  프로필은 이름+프로필 이미지만 있으면 그게 프로필이다.
- `MeProfile` 은 `name` 과 `imageUrl` 만 받는다. `tagline` · `onEdit` 프롭이 없다.
