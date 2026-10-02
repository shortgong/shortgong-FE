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
- `accessToken` lives in memory only (`src/api/client.ts`). Never localStorage.
- `refreshToken` is HttpOnly — the backend sets it. FE only sends it via `credentials: 'include'`. FE must never try to write it.
- A reload re-issues via `POST /api/auth/token/refresh` (cookie). Gated on the `localStorage.shortgong.session` hint so anonymous visitors make **zero** API calls.
- `AUTH_ORIGIN` (absolute) is separate from `API_BASE` — OAuth navigation must never become a relative path, or it lands back in the SPA and gets swallowed by the catch-all route.

## Data
- `src/data/content.ts`: study sets, shorts, questions. `Short.html?` holds embed HTML for that short.
- `src/data/embedDocs.ts`: mock embed HTML (CARD/STAT/TALL/TTS). TTS uses ko-KR SpeechSynthesis with `onstart/onend/onerror` logging to `#s`.

## Verification
- Run tsc/lint/build. Run relevant Playwright checks in `/tmp/opencode/`. All must pass before push.

## github
- 매번 커밋 할 것. 브랜치 나누는 거 할 것, 머지할 것 등등