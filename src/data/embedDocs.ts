/**
 * 쇼츠 임베드용 목 HTML.
 *
 * 인제스트 파이프라인은 buildEmbedDoc(body, CSP_META) 형태로 내려주고
 * 프론트는 sandbox/allow 만 지정한다. CSP 는 백엔드가 주입한다(단일 출처).
 */


/**
 * 카드형
 */
const CARD = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background: #0f1412; color: #fff; font-family: system-ui, -apple-system, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; text-align: center; padding: 24px; overflow: hidden;
  }
  .c { width: 88px; height: 88px; border-radius: 20px; background: radial-gradient(120px 80px at 50% 30%, #24352e, #111815); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,.08); }
  .d { width: 48px; height: 48px; border-radius: 14px; background: #4fd39a; opacity: .9; }
  .t { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
  .s { font-size: 13px; color: #7f9f92; }
</style>
</head>
<body>
  <div class="c"><div class="d"></div></div>
  <div>
    <p class="t">미분 개념 한눈에</p>
    <p class="s">도함수의 정의부터 응용까지</p>
  </div>
</body>
</html>`;

/**
 * 통계형
 */
const STAT = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background: #0f1412; color: #fff; font-family: system-ui, -apple-system, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; text-align: center; padding: 24px; overflow: hidden;
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
 * 긴 문서
 */
const TALL = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { margin: 0; padding: 16px; font: 500 14px/1.7 sans-serif; color: #eaf3ee; background: transparent; overflow: hidden; }
  li { margin-bottom: 10px; }
</style>
</head>
<body>
  <ul>
    ${Array.from({ length: 20 }, (_, i) => `<li>항목 ${i + 1}</li>`).join('\n    ')}
  </ul>
</body>
</html>`;

/**
 * TTS
 */
const TTS = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background: radial-gradient(1200px 800px at 50% 30%, #19221d 0%, #0f1412 100%);
    color: #fff; font-family: system-ui, -apple-system, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; text-align: center; padding: 24px; overflow: hidden;
  }
  .svg { width: 64px; height: 64px; }
  .text { font-size: 16px; font-weight: 700; line-height: 1.45; letter-spacing: -.01em; }
  #s { opacity: 0; transition: opacity .3s ease-in-out; min-height: 1.2em; }
  #s.show { opacity: 1; }
  @keyframes pulse { 0% { transform: scale(.96); opacity: .5 } 100% { transform: scale(1.08); opacity: .9 } }
  .p { animation: pulse 1.2s ease-in-out infinite alternate; }
</style>
</head>
<body>
  <svg class="svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#4fd39a" opacity=".15"></circle>
    <circle class="p" cx="12" cy="12" r="7" fill="#4fd39a" opacity=".5"></circle>
    <circle cx="12" cy="12" r="4" fill="#4fd39a"></circle>
  </svg>
  <div class="text" id="t">도함수의 핵심은<br/>변화율입니다</div>
  <div id="s">TTS 미지원</div>
<script>
  try { Object.defineProperty(window, 'location', { writable: false, configurable: false, value: {} }); } catch (e) {}
  if (window.open) window.open = function() { return null; };
  window.speechSynthesis.onvoiceschanged = null;
  var t = document.getElementById('t');
  var sEl = document.getElementById('s');
  var txt = t.innerText.replace(/<br\\/>/g, ' ');
  var u = new SpeechSynthesisUtterance(txt);
  u.lang = 'ko-KR'; u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
  u.onstart = function() { sEl.classList.add('show'); sEl.textContent = '말하는 중...'; };
  u.onend = function() { sEl.textContent = '발화 완료'; };
  u.onerror = function(e) { sEl.classList.add('show'); sEl.textContent = e.error || 'synthesis-failed'; };
  window.speechSynthesis.cancel();
  var v = null;
  try { var voices = window.speechSynthesis.getVoices(); for (var i = 0; i < voices.length; i++) { if (voices[i].lang && voices[i].lang.indexOf('ko') === 0) { v = voices[i]; break; } } } catch (e) {}
  if (v) u.voice = v;
  window.setTimeout(function() { try { window.speechSynthesis.speak(u); } catch (e) { sEl.classList.add('show'); sEl.textContent = 'speak 호출됨'; } }, 250);
</script>
</body>
</html>`;

export function buildEmbedDoc(body: string, csp: string): string {
  return body.replace(/<head>/i, '<head>\n' + csp);
}

export const EMBED_DOCS: Record<'card' | 'stat' | 'tall' | 'tts', string> = {
  card: CARD,
  stat: STAT,
  tall: TALL,
  tts: TTS,
};
