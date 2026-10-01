/**
 * 쇼츠 임베드 보안 정책 — 인제스트 계약의 단일 출처.
 *
 * 프론트엔드는 이 파일의 값을 참고만 하고, 실제로 CSP 를 주입하지는 않는다.
 * 주입은 백엔드/업로드 파이프라인이 `buildEmbedDoc` 결과에 적용한다.
 * 프론트에서 주입하면 author 가 CSP 를 제거한 HTML 을 그대로 받아들이게 된다.
 */

/**
 * iframe sandbox 토큰 — 빈 값. 즉 전부 거부.
 *
 * sandbox 에는 autoplay 토큰이 없다. `allow-autoplay` 을 쓰면 Chrome 이
 * "invalid sandbox flag" 오류를 낸다(알려지지 않은 토큰은 무시되므로
 * 결과적으로 빈 sandbox 와 같지만, 콘솔이 시끄럽다).
 * 자동재생은 sandbox 가 아니라 Permissions Policy 인 `allow="autoplay"` 로 제어한다.
 * 브라우저 자동재생 정책상 문서 제스처가 선행돼야 실제 재생이 시작되므로,
 * ShortEmbed 는 첫 탭 뒤에 iframe 을 마운트한다.
 *
 * 터치는 토큰이 필요 없다. 포인터 이벤트와 :hover/:active CSS 상태는
 * sandbox 없이도, 심지어 빈 sandbox 에서도 동작한다.
 *
 * 빈 sandbox 가 막는 것:
 *   allow-scripts          — JS 실행 금지 요구사항
 *   allow-same-origin      — 우리 origin 의 쿠키/스토리지 접근 차단.
 *                            allow-scripts 와 같이 쓰면 sandbox 탈출이 가능해진다
 *   allow-popups           — 새 창 열기 차단
 *   allow-forms            — 폼 서밋으로 외부 전송되는 경로 차단
 *   allow-top-navigation   — 상위 프레임 이동 차단
 *   allow-modals           — alert/confirm 등 차단
 *   allow-downloads        — 다운로드 차단
 *   allow-pointer-lock     — 포인터 잠금 차단
 *   allow-presentation     — 전체 화면 API 차단
 *   allow-orientation-lock — 화면 고정 차단
 */
export const EMBED_SANDBOX = '';

/** autoplay 은 sandbox 토큰이 아니라 Permissions Policy 로 준다 */
export const EMBED_ALLOW = 'autoplay';

/**
 * 임베드 문서 CSP.
 *
 * sandbox 에는 네트워크 차단 토큰이 없으므로, 네트워크는 여기서만 막는다.
 * default-src 'none' 이 명시하지 않은 모든 로딩을 막고,
 * connect-src 'none' 이 fetch/XHR/WebSocket/EventSource 를 막는다.
 * style-src 'unsafe-inline' 만 열어둔다 — author HTML 의 인라인 <style>/style= 사용.
 */
export const EMBED_CSP =
  "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'none'; " +
  "connect-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; " +
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
 */
export const EMBED_FIT_RULE =
  '임베드 문서는 세로로 넘치지 않을 것. 넘치면 iframe 이 스와이프를 소비한다.';

/** 인제스트가 제거해야 하는 요소/속성 — 정규식 검증용 목록 */
export const EMBED_FORBIDDEN = [
  /<\s*script/i,
  /<\s*iframe/i,
  /<\s*object/i,
  /<\s*embed/i,
  /<\s*form/i,
  /<\s*base/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
  /@import/i,
  /http-equiv\s*=\s*["']?refresh/i,
];

/** author HTML 에 금지 패턴이 섞였는지 검사한다. 인제스트 검증용 */
export function findEmbedViolations(html: string): string[] {
  return EMBED_FORBIDDEN.filter((re) => re.test(html)).map(String);
}
