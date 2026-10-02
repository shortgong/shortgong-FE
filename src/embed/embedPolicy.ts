/**
 * 쇼츠 임베드 보안 정책 — 인제스트 계약의 단일 출처.
 *
 * 프론트엔드는 이 파일의 값을 참고만 하고, 실제로 CSP 를 주입하지는 않는다.
 * 주입은 백엔드/업로드 파이프라인이 `buildEmbedDoc` 결과에 적용한다.
 * 프론트에서 주입하면 author 가 CSP 를 제거한 HTML 을 그대로 받아들이게 된다.
 */

/**
 * iframe sandbox 토큰.
 *
 * 쇼츠 본문은 `window.speechSynthesis` 로 TTS 를 自动 재생하므로
 * JS 실행이 반드시 필요하다. 레퍼런스 구현(ShortGong Demo)도 같은 구성을 쓴다:
 *
 *     f.setAttribute('sandbox', 'allow-scripts');
 *     f.setAttribute('allow', 'autoplay');
 *     f.srcdoc = items[i].html;
 *
 * sandbox 에는 autoplay 토큰이 없다. `allow-autoplay` 을 쓰면 Chrome 이
 * "invalid sandbox flag" 오류를 낸다. 자동재생은 sandbox 가 아니라
 * Permissions Policy 인 `allow="autoplay"` 로 제어한다.
 *
 * 빈 sandbox 여야 하는 줄 알았지만, TTS 때문에 allow-scripts 가 필요해졌다.
 * 그 결과 방어선이 CSP 로 이동한다 — script-src 를 열면 JS 가 돌아가므로
 * 네트워크 차단이 전부 CSP 몫이 된다. 그만큼 CSP 는 후퇴 없이 그대로여야 한다.
 *
 * 넣지 않는 토큰과 이유:
 *   allow-same-origin      — ★가장 중요. 우리 origin 의 쿠키/스토리지 접근 차단.
 *                            allow-scripts 와 같이 주면 sandbox 탈출이 가능해진다
 *                            (자기가 iframe 태그를 찾아 sandbox 를 지우고 다시 로드한다).
 *                            이 조합은 절대 같이 쓰지 않는다.
 *                            allow-same-origin 이 없으므로 문서 오리진이 불투명해진다.
 *   allow-popups           — 새 창 열기 차단
 *   allow-forms            — 폼 서밋으로 외부 전송되는 경로 차단
 *   allow-top-navigation   — 상위 프레임 이동 차단
 *   allow-modals           — alert/confirm 등 차단
 *   allow-downloads        — 다운로드 차단
 *   allow-pointer-lock     — 포인터 잠금 차단
 *   allow-presentation     — 전체 화면 API 차단
 *   allow-orientation-lock — 화면 고정 차단
 */
export const EMBED_SANDBOX = 'allow-scripts';

/** autoplay 은 sandbox 토큰이 아니라 Permissions Policy 로 준다 */
export const EMBED_ALLOW = 'autoplay';

/**
 * 임베드 문서 CSP.
 *
 * ★ 이 문서가 이제 유일한 방어선이다. allow-scripts 때문에 JS 가 돌아가고,
 * sandbox 에는 네트워크 차단 토큰이 없다. CSP 는 부모가 주입하고 자식은 완화할 수
 * 없으므로(뒤에 나온 정책이 앞선 걸 이긴다) author 가 자기 CSP 를 써도 ours 가 이긴다.
 *
 *   default-src 'none'  — 명시하지 않은 모든 로딩 차단. 애셋이 data: 로 강제된다
 *   connect-src 'none'  — ★ fetch/XHR/WebSocket/EventSource/sendBeacon 전부 차단.
 *                         이 지점이 JS를 열어도 나가지 못하게 막는 곳이다
 *   script-src 'unsafe-inline' 'unsafe-eval' — TTS 스크립트를 위해 연다.
 *                         nonce/hash 로 좁히는 건 인제스트가 스크립트를 다시 서명해야 해서
 *                         파이프라인 복잡도가 크게 올라간다. 인제스트 단계에서 스크립트가
 *                         우리 코드라는 전제(저장소 제출자=발행자)로 간다
 *   style-src 'unsafe-inline' — author 의 인라인 <style>/style= 사용
 *
 * CSP 로는 막히지 않는 것 — 인제스트에서 제거해야 한다:
 *   iframe 자신의 탐색(location.href/replace, target=_blank 링크, meta refresh).
 *   Chrome 은 navigate-to 를 지원하지 않아 CSP 로 막을 방법이 없다.
 *   그 결과 문서가 스스로 외부 페이지로 넘어갈 수 있다.
 */
export const EMBED_CSP =
  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; " +
  "script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; " +
  "img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; " +
  "font-src data:; form-action 'none'; base-uri 'none'\">";

/**
 * 피트 규칙 (프레너가 지켜야 함).
 *
 * 임베드 문서는 슬라이드 안에 그대로 들어가므로, 세로로 넘치지 않게 authoring 해야 한다.
 * 넘치면 iframe 이 자체 스크롤을 소비해 세로 스와이프가 쇼츠 넘기기를 가로막는다.
 *
 * 넘치지 않으면 반대편이 성립한다 — Chrome 은 내부 스크롤이 없는 iframe 의
 * 터치 스크롤을 부모 컨테이너로 체인시킨다. 그래서 같은 드래그가
 *   · 임베드 안의 터치(버튼 등) 를 건드리고
 *   · 동시에 다음 쇼츠로 넘긴다
 * 이 둘을 충돌 없이 처리한다. iframe 이 터치를 소비하는 것은 마운트가 아니라
 * "내부 스크롤이 있는 경우" 다.
 *
 * 세로 넘침이 꼭 필요한 콘텐츠라면 두 갈래뿐이다:
 *   · 넘치는 분량을 margin-bottom 으로 프레임 밖으로 빼서 세로 스크롤을 없앤다
 *   · 넘치는 대신 그 슬라이드에서 스와이프를 포기하고 iframe 위 스크롤을 허용한다
 * 부모가 `overflow: hidden` 을 강제로 걸어도 스크롤 체이닝은 복구되지 않는다
 * (iframe 문서 자체가 스크롤 컨테이너가 되기 때문). 그래서 이건 authoring 규칙이다.
 *
 * author 규칙 — 이틀만 지켜도 대부분 잡힌다:
 *   1. `*, *::before, *::after { box-sizing: border-box }` 를 먼저 선언한다.
 *      `height: 100%` 에 `padding` 을 주면 스크롤바가 생겨 피트 규칙을 어긴다.
 *      실제로 padding 24px 두 축(48px)만큼 넘쳐 스와이프가 막힌 사례가 있다.
 *   2. `body { height: 100%; overflow: hidden }` — 넘침을 숨겨 넘침 가능성을 없앤다.
 *      넘친 부분이 잘리는 게 스와이프가 죽는 것보다 낫다.
 *   3. 뷰포트 meta 를 넣는다. 없으면 모바일에서 글자가 임의 크기로 blow-up 된다.
 */
export const EMBED_FIT_RULE =
  '임베드 문서는 세로로 넘치지 않을 것. 넘치면 iframe 이 스와이프를 소비한다.';

/**
 * 인제스트가 제거해야 하는 요소/속성 — 정규식 검증용 목록.
 *
 * <script> 는 더 이상 제거 대상이 아니다 (TTS 가 필요).
 * 대신 JS로 탈출하거나 문서를 빼앗는 벡터를 막는다.
 * <a href> 는 CSP 가 막아주지 않는다는 점이 특히 중요하다.
 */
export const EMBED_FORBIDDEN = [
  /* 중첩 프레이밍 — sandbox 를 건너뛰거나 부모를 조작하는 통로 */
  /<\s*iframe/i,
  /<\s*object/i,
  /<\s*embed/i,
  /<\s*frame\b/i,
  /* form 은 allow-forms 없이 서밋도 안 되지만, action 자체를 지운다 */
  /<\s*form/i,
  /* <base href> — 이후 모든 상대 URL 해석을 바꿔버린다 */
  /<\s*base/i,
  /* ★ 탐색. CSP default-src 은 문서 탐색을 막지 않는다.
     Chrome 은 navigate-to directives 를 지원하지 않아 막을 방법이 없다.
     자기 자신으로의 이동(위임문 예: location.replace)까지 막을 수는 없으므로,
     인제스트가 제거할 수 있는 것들만 여기 둔다. */
  /<\s*a\b[^>]*\shref\s*=/i,
  /http-equiv\s*=\s*["']?refresh/i,
  /\starget\s*=\s*["']?_blank/i,
  /javascript:/i,
  /* 외부 리소스 — CSP 가 막지만 경고 로그가 찍히므로 애초에 뺀다 */
  /@import/i,
];

/** author HTML 에 금지 패턴이 섞였는지 검사한다. 인제스트 검증용 */
export function findEmbedViolations(html: string): string[] {
  return EMBED_FORBIDDEN.filter((re) => re.test(html)).map(String);
}
