/**
 * 임베드 문서의 수명주기 관리.
 *
 * 왜 부모에서 그냥 `speechSynthesis.cancel()` 로 끝낼 수 없는가:
 * sandbox 에 allow-same-origin 이 없어(iframe 문서 오리진이 불투명) 부모는
 * `iframe.contentWindow` 에 손대지 못한다. 즉 자식 안에서만 멈출 수 있다.
 * 그래서 문서가 스스로 teardown 을 감지해 자기 발화를 정리하게 만든다.
 *
 * 왜 `cancel()` 하나로는 부족한가:
 * author 코드가 `utterance.onend → playScene(next)` 로 발화를 이어 붙인다.
 * cancel 하면 Chrome 은 취소된 발화에도 onend を 쏜다. 그러면 곧바로 다음 장면이
 * 다시 큐에 올라가고, 그 발화는 이미 버려진 문서의 발화라 마비가 안 된다 —
 * 사용자가 다른 화면으로 갔는데도 말이 계속되는就是这个 경우다.
 * 그래서 teardown 에서는 speak 자체를 무음으로 바꿔, 재예약이 일어나도 발화되지 않게 한다.
 *
 * 부모는 이렇게 쓴다:
 *   · 활성화되지 않은 슬라이드는 iframe 을 아예 마운트하지 않는다 (되돌릴 방법이 없으니
 *     없애는 게 유일한 방법이다)
 *   · 화면을 벗어나면 마운트가 풀리므로 pagehide 가 울려 여기서 정리된다
 */

/** 문서 시작부에 붙는 스크립트. CSP script-src 'unsafe-inline' 이라 실행된다 */
const GUARD = `<script>
(function () {
  var done = false;
  var shutUp = function () {
    if (done) return;
    done = true;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    /* onend 로 재예약된 발화가 통과하지 못하게 한다 — cancel 뒤에 해야 한다.
       onend 는 비동기로 오므로, 곧바로 뒤따르는 speak 는 이미 막혀 있다. */
    try { window.speechSynthesis.speak = function () {}; } catch (e) {}
    try { console.debug('[embed] teardown — 발화 정리'); } catch (e) {}
  };
  window.addEventListener('pagehide', shutUp);
  window.addEventListener('unload', shutUp);
})();
</script>`;

/**
 * author HTML 앞에 수명주기 가드를 붙인다.
 *
 * doctype 이 앞으로 밀리면 quirks 모드가 되므로 `<head>` 안쪽, 없으면 `<html>` 뒤,
 * 둘 다 없으면 맨 앞에 넣는다. head 가 없으면 <html> 태그도 없을 수 있어
 * 결국 prepend 로 떨어진다.
 */
export function withLifecycle(html: string): string {
  const head = /<head\b[^>]*>/i.exec(html);
  if (head) return html.slice(0, head.index + head[0].length) + GUARD + html.slice(head.index + head[0].length);

  const htmlTag = /<html\b[^>]*>/i.exec(html);
  if (htmlTag) {
    const at = htmlTag.index + htmlTag[0].length;
    return html.slice(0, at) + GUARD + html.slice(at);
  }

  const body = /<body\b[^>]*>/i.exec(html);
  if (body) {
    const at = body.index + body[0].length;
    return html.slice(0, at) + GUARD + html.slice(at);
  }

  return GUARD + html;
}