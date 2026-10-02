# HANDOFF

## Current State
- Branch: `feat/short-embed` (committed, pushed)
- Recent commit: refactor embed — direct srcDoc, CTA inside iframe, box-sizing+overflow hidden, pointer-events none
- Typecheck/lint/build: PASS
- Parent "play" UI removed. Iframe mounts immediately.

## Decisions
- JS required for TTS → sandbox `allow-scripts`, CSP is defense (no allow-same-origin).
- Autoplay via `allow="autoplay"` (not sandbox token).
- Swipe preserved by `pointer-events: none` on iframe (scripts execute).
- Network isolation verified (CSP blocks external requests). Navigation attempts blocked.

## Pending/Next
- Verify Playwright checks: `ttscheck.mjs`, `embedcheck.mjs` (update to new policy: `allow-scripts`, JS allowed). Some legacy checks expect old mount flow.
- Backend integration: ingest returns self-contained HTML (with CSP injected). Test against `http://localhost:8080` with provided token if needed (Swagger: /swagger-ui/index.html).
- TALL case may overflow (by design) — enforce fit at authoring or accept clipping.

## Quick Start
```bash
cd /home/user/Desktop/workspace/shortgong/shortgong-FE
npm run dev  # 127.0.0.1:5199
cd /tmp/opencode && node ttscheck.mjs
```
