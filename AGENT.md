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