/**
 * 쇼츠 임베드 — 인제스트 계약
 *
 * 실제 서비스에서는 이 HTML을 브라우저가 아니라 백엔드가 만들어 내려줍니다.
 * 프론트는 `Short.html` 을 받아 `sandbox` iframe 에 넣기만 합니다.
 *
 * 인제스트가 지켜야 할 규칙 (src/embed/embedPolicy.ts 의 상수와 1:1 대응):
 *   1. 스크립트 제거 — <script>, on* 속성, javascript: URL
 *   2. 임베드 불가 요소 제거 — <iframe>, <object>, <embed>, <form>, <base>, meta refresh
 *   3. 모든 애셋 인라인 — img/audio/video/font 을 data: URI 로
 *      (blob: 은 allow-same-origin 없는 불투명 오리진에서 차단된다)
 *   4. EMBED_CSP 를 <head> 맨 앞에 삽입
 *
 * CSP 는 뒤에 오는 정책으로 완화할 수 없으므로, author HTML 이 자기 CSP 를
 * 가지고 있어도 ours 가 이깁니다.
 */

/** 테스트용 오디오. 0.5초 440Hz sine, 8kHz mono 8bit WAV */
const BEEP =
  'UklGRsQPAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAPAACAnrnN2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aI' +
  'aU03KSYtPld0k7DH1dnTw6uOb1I6KyYrOlJvjqvD09nVx7CTdFc+LSYpN01piKa/0dnXyrSZelxCLyYoNEhkgqG7ztjYzbme' +
  'f2FGMicnMURefZu3y9fZ0L2jhWZLNSgmLkBZd5ayyNbZ0sGoi2xPOComLDxUcZCtxdTa1MWtkHFUPCwmKjhPbIuowdLZ1siy' +
  'lndZQC4mKDVLZoWjvdDZ18u3m31eRDEnJzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZtMrX2dG/pohpTTcpJi0+V3STsMfV2dPD' +
  'q45vUjorJis6Um+Oq8PT2dXHsJN0Vz4tJik3TWmIpr/R2dfKtJl6XEIvJig0SGSCobvO2NjNuZ6AYUYyJycxRF59m7fL19nQ' +
  'vaOFZks1KCYuQFl3lrLI1tnSwaiLbE84KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9si6jB0tnWyLKWd1lALiYoNUtmhaO90NnX' +
  'y7ebfV5EMScnMkZhgJ65zdjYzruhgmRINCgmL0Jcepm0ytfZ0b+miGlNNykmLT5XdJOwx9XZ08Orjm9SOismKzpSb46rw9PZ' +
  '1cewk3RXPi0mKTdNaYimv9HZ18q0mXpcQi8mKDRIZIKhu87Y2M25nn9hRjInJzFEXn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW' +
  '2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBxVDwsJio4T2yLqMHS2dbIspZ3WUAuJig1S2aFo73Q2dfLt5t9XkQxJycyRmF/nrnN' +
  '2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aIaU03KSYtPld0k7DH1dnTw6uOb1I6KyYrOlJvjqvD09nVx7CTdFc+LSYpN01piKa/' +
  '0dnXyrSZelxCLyYoNEhkgqG7ztjYzbmef2FGMicnMURefZu3y9fZ0L2jhWZLNSgmLkBZd5ayyNbZ0sGoi2xPOComLDxUcZCt' +
  'xdTa1MWtkHFUPCwmKjhPbIuowdLZ1siylndZQC4mKDVLZoWjvdDZ18u3m31eRDEnJzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZ' +
  'tMrX2dG/pohpTTcpJi0+V3STsMfV2dPDq45vUjorJis6Um+Oq8PT2dXHsJN0Vz4tJik3TWmIpr/R2dfKtJl6XEIvJig0SGSC' +
  'obvO2NjNuZ5/YUYyJycxRF59m7fL19nQvaOFZks1KCYuQFl3lrLI1tnSwaiLbE84KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9s' +
  'i6jB0tnWyLKWd1lALiYoNUtmhaO90NnXy7ebfV5EMScnMkZhgJ65zdjYzruhgmRINCgmL0Jcepm0ytfZ0b+miGlNNykmLT5X' +
  'dJOwx9XZ08Orjm9SOismKzpSb46rw9PZ1cewk3RXPi0mKTdNaYimv9HZ18q0mXpcQi8mKDRIZIKhu87Y2M25nn9hRjInJzFE' +
  'Xn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBxVDwsJio4T2yLqMHS2dbIspZ3WUAuJig1' +
  'S2aFo73Q2dfLt5t9XkQxJycyRmF/nrnN2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aIaU03KSYtPld0k7DH1dnTw6uOb1I6KyYr' +
  'OlJvjqvD09nVx7CTdFc+LSYpN01piKa/0dnXyrSZelxCLyYoNEhkgqG7ztjYzbmegGFGMicnMURefZu3y9fZ0L2jhWZLNSgm' +
  'LkBZd5ayyNbZ0sGoi2xPOComLDxUcZCtxdTa1MWtkHFUPCwmKjhPbIuowdLZ1siylndZQC4mKDVLZoWjvdDZ18u3m31eRDEn' +
  'JzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZtMrX2dG/pohpTTcpJi0+V3STsMfV2dPDq45vUjorJis6Um+Oq8PT2dXHsJN0Vz4t' +
  'Jik3TWmIpr/R2dfKtJl6XEIvJig0SGSCobvO2NjNuZ5/YUYyJycxRF59m7fL19nQvaOFZks1KCYuQFl3lrLI1tnSwaiLbE84' +
  'KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9si6jB0tnWyLKWd1lALiYoNUtmhaO90NnXy7ebfV5EMScnMkZhgJ65zdjYzruhgmRI' +
  'NCgmL0Jcepm0ytfZ0b+miGlNNykmLT5XdJOwx9XZ08Orjm9SOismKzpSb46rw9PZ1cewk3RXPi0mKTdNaYimv9HZ18q0mXpc' +
  'Qi8mKDRIZIKhu87Y2M25nn9hRjInJzFEXn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBx' +
  'VDwsJio4T2yLqMHS2dbIspZ3WUAuJig1S2aFo73Q2dfLt5t9XkQxJycyRmGAnrnN2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aI' +
  'aU03KSYtPld0k7DH1dnTw6uOb1I6KyYrOlJvjqvD09nVx7CTdFc+LSYpN01piKa/0dnXyrSZelxCLyYoNEhkgqG7ztjYzbme' +
  'f2FGMicnMURefZu3y9fZ0L2jhWZLNSgmLkBZd5ayyNbZ0sGoi2xPOComLDxUcZCtxdTa1MWtkHFUPCwmKjhPbIuowdLZ1siy' +
  'lndZQC4mKDVLZoWjvdDZ18u3m31eRDEnJzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZtMrX2dG/pohpTTcpJi0+V3STsMfV2dPD' +
  'q45vUjorJis6Um+Oq8PT2dXHsJN0Vz4tJik3TWmIpr/R2dfKtJl6XEIvJig0SGSCobvO2NjNuZ5/YUYyJycxRF59m7fL19nQ' +
  'vaOFZks1KCYuQFl3lrLI1tnSwaiLbE84KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9si6jB0tnWyLKWd1lALiYoNUtmhaO90NnX' +
  'y7ebfV5EMScnMkZhgJ65zdjYzruhgmRINCgmL0Jcepm0ytfZ0b+miGlNNykmLT5XdJOwx9XZ08Orjm9SOismKzpSb46rw9PZ' +
  '1cewk3RXPi0mKTdNaYimv9HZ18q0mXpcQi8mKDRIZIKhu87Y2M25nn9hRjInJzFEXn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW' +
  '2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBxVDwsJio4T2yLqMHS2dbIspZ3WUAuJig1S2aFo73Q2dfLt5t9XkQxJycyRmF/nrnN' +
  '2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aIaU03KSYtPld0k7DH1dnTw6uOb1I6KyYrOlJvjqvD09nVx7CTdFc+LSYpN01piKa/' +
  '0dnXyrSZelxCLyYoNEhkgqG7ztjYzbmef2FGMicnMURefZu3y9fZ0L2jhWZLNSgmLkBZd5ayyNbZ0sGoi2xPOComLDxUcZCt' +
  'xdTa1MWtkHFUPCwmKjhPbIuowdLZ1siylndZQC4mKDVLZoWjvdDZ18u3m31eRDEnJzJGYX+euc3Y2M67oYJkSDQoJi9CXHqZ' +
  'tMrX2dG/pohpTTcpJi0+V3STsMfV2dPDq45vUjorJis6Um+Oq8PT2dXHsJN0Vz4tJik3TWmIpr/R2dfKtJl6XEIvJig0SGSC' +
  'obvO2NjNuZ6AYUYyJycxRF59m7fL19nQvaOFZks1KCYuQFl3lrLI1tnSwaiLbE84KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9s' +
  'i6jB0tnWyLKWd1lALiYoNUtmhaO90NnXy7ebfV5EMScnMkZhgJ65zdjYzruhgmRINCgmL0Jcepm0ytfZ0b+miGlNNykmLT5X' +
  'dJOwx9XZ08Orjm9SOismKzpSb46rw9PZ1cewk3RXPi0mKTdNaYimv9HZ18q0mXpcQi8mKDRIZIKhu87Y2M25noBhRjInJzFE' +
  'Xn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBxVDwsJio4T2yLqMHS2dbIspZ3WUAuJig1' +
  'S2aFo73Q2dfLt5t9XkQxJycyRmGAnrnN2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aIaU03KSYtPld0k7DH1dnTw6uOb1I6KyYr' +
  'OlJvjqvD09nVx7CTdFc+LSYpN01piKa/0dnXyrSZelxCLyYoNEhkgqG7ztjYzbmef2FGMicnMURefZu3y9fZ0L2jhWZLNSgm' +
  'LkBZd5ayyNbZ0sGoi2xPOComLDxUcZCtxdTa1MWtkHFUPCwmKjhPbIuowdLZ1siylndZQC4mKDVLZoWjvdDZ18u3m31eRDEn' +
  'JzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZtMrX2dG/pohpTTcpJi0+V3STsMfV2dPDq45vUjorJis6Um+Oq8PT2dXHsJN0Vz4t' +
  'Jik3TWmIpr/R2dfKtJl6XEIvJig0SGSCobvO2NjNuZ5/YUYyJycxRF59m7fL19nQvaOFZks1KCYuQFl3lrLI1tnSwaiLbE84' +
  'KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9si6jB0tnWyLKWd1lALiYoNUtmhaO90NnXy7ebfV5EMScnMkZhgJ65zdjYzruhgmRI' +
  'NCgmL0Jcepm0ytfZ0b+miGlNNykmLT5XdJOwx9XZ08Orjm9SOismKzpSb46rw9PZ1cewk3RXPi0mKTdNaYimv9HZ18q0mXpc' +
  'Qi8mKDRIZIKhu87Y2M25noBhRjInJzFEXn2bt8vX2dC9o4VmSzUoJi5AWXeWssjW2dLBqItsTzgqJiw8VHGQrcXU2tTFrZBx' +
  'VDwsJio4T2yLqMHS2dbIspZ3WUAuJig1S2aFo73Q2dfLt5t9XkQxJycyRmGAnrnN2NjOu6GCZEg0KCYvQlx6mbTK19nRv6aI' +
  'aU03KSYtPld0k7DH1dnTw6uOb1I6KyYrOlJvjqvD09nVx7CTdFc+LSYpN01piKa/0dnXyrSZelxCLyYoNEhkgqG7ztjYzbme' +
  'f2FGMicnMURefZu3y9fZ0L2jhWZLNSgmLkBZd5ayyNbZ0sGoi2xPOComLDxUcZCtxdTa1MWtkHFUPCwmKjhPbIuowdLZ1siy' +
  'lndZQC4mKDVLZoWjvdDZ18u3m31eRDEnJzJGYYCeuc3Y2M67oYJkSDQoJi9CXHqZtMrX2dG/pohpTTcpJi0+V3STsMfV2dPD' +
  'q45vUjorJis6Um+Oq8PT2dXHsJN0Vz4tJik3TWmIpr/R2dfKtJl6XEIvJig0SGSCobvO2NjNuZ5/YUYyJycxRF59m7fL19nQ' +
  'vaOFZks1KCYuQFl3lrLI1tnSwaiLbE84KiYsPFRxkK3F1NrUxa2QcVQ8LCYqOE9si6jB0tnWyLKWd1lALiYoNUtmhaO90NnX' +
  'y7ebfV5EMScnMkZh';

/** 확인 카드 — 스크립트 없이 CSS 와 폼 서밋만으로 동작한다 */
const CARD = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; }
  body {
    display: grid; place-items: center; padding: 20px;
    font: 500 15px/1.6 -apple-system, system-ui, sans-serif;
    color: #eaf3ee; background: transparent; text-align: center;
  }
  .card {
    width: 100%; max-width: 300px; padding: 22px 18px; border-radius: 18px;
    background: #17211d; border: 1px solid #2c3a34;
  }
  .k { font-size: 11px; letter-spacing: .1em; color: #7fb59c; }
  .q { margin: 10px 0 14px; font-size: 17px; font-weight: 700; }
  .opt {
    display: block; width: 100%; margin-top: 8px; padding: 12px 14px;
    border-radius: 12px; background: #1e2a25; border: 1px solid #2c3a34;
    color: #dce9e2; font: inherit; text-align: left; cursor: pointer;
  }
  .opt:active { background: #24463a; border-color: #3f7a60; }
  .hint { margin-top: 14px; font-size: 12px; color: #6d8a7d; }
  audio { width: 100%; margin-top: 16px; }
</style>
</head>
<body>
  <div class="card">
    <p class="k">미적분 · 확인</p>
    <p class="q">f(x) = x² 에서 f'(3) 은?</p>
    <div>
      <button class="opt" type="button">3</button>
      <button class="opt" type="button">6</button>
      <button class="opt" type="button">9</button>
    </div>
    <p class="hint">보기를 눌러 보세요</p>
    <audio controls loop preload="auto" src="data:audio/wav;base64,${BEEP}"></audio>
  </div>
</body>
</html>`;

/** 점수 요약 — 오디오 없이 색과 텍스트만 */
const STAT = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    display: grid; place-items: center; padding: 20px; height: 100%;
    font: 500 15px/1.6 -apple-system, system-ui, sans-serif;
    color: #eaf3ee; background: transparent; text-align: center;
  }
  .g { font-size: 56px; font-weight: 800; line-height: 1; letter-spacing: -.02em; }
  .n { margin-top: 10px; font-size: 13px; color: #7fb59c; }
  .c { margin-top: 16px; display: flex; gap: 6px; justify-content: center; }
  .c i { width: 7px; height: 7px; border-radius: 50%; background: #2c3a34; }
  .c i.on { background: #4fd39a; }
</style>
</head>
<body>
  <div>
    <p class="g">92%</p>
    <p class="n">평균과 중앙값</p>
    <p class="c"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></p>
  </div>
</body>
</html>`;

/**
 * 세로로 넘치는 문서 — 피트 규칙(EMBED_FIT_RULE) 위반 케이스.
 * 이 문서는 iframe 이 자체 스크롤을 소비해 세로 스와이프를 막는다.
 * 계약이 실제로 무엇을 막는지 확인하기 위한 음성对照용이다.
 */
const TALL = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin: 0; padding: 16px; font: 500 14px/1.7 sans-serif; color: #eaf3ee; background: transparent; }
  li { margin-bottom: 10px; }
</style>
</head>
<body>
  <ul>
    ${Array.from({ length: 40 }, (_, i) => `<li>항목 ${i + 1} — 이 문서는 프레임보다 훨씬 깁니다</li>`).join('\n    ')}
  </ul>
</body>
</html>`;

/** 인제스트 산출물의 형식대로 CSP meta 를 <head> 맨 앞에 넣는다 */
export function buildEmbedDoc(body: string, csp: string): string {
  return body.replace(/<head>/i, `<head>\n${csp}`);
}

export const EMBED_DOCS: Record<'card' | 'stat' | 'tall', string> = {
  card: CARD,
  stat: STAT,
  tall: TALL,
};
