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
- Swipes: iframe uses `pointer-events: none` (TTS/JS still run) so parent vertical swipe works.
- CTA ("눌러서 보기") lives inside iframe HTML (not parent). No play button in parent.
- Mount: iframe renders immediately when HTML present (no first-gesture gate in parent).

## Data
- `src/data/content.ts`: study sets, shorts, questions. `Short.html?` holds embed HTML for that short.
- `src/data/embedDocs.ts`: mock embed HTML (CARD/STAT/TALL/TTS). TTS uses ko-KR SpeechSynthesis with `onstart/onend/onerror` logging to `#s`.

## Verification
- Run tsc/lint/build. Run relevant Playwright checks in `/tmp/opencode/`. All must pass before push.
