import { EMBED_ALLOW, EMBED_SANDBOX } from "../embed/embedPolicy";
import { withLifecycle } from "../embed/embedLifecycle";
import "./ShortEmbed.css";

type Props = {
  id: string;
  html?: string;
  tone: string;
  title: string;
  active?: boolean;
};

/**
 * 쇼츠 본문 임베드.
 *
 * html 이 없으면 렌더링하지 않는다 — 인제스트된 self-contained HTML 을
 * sandbox + CSP 조건 하에 바로 렌더링한다.
 * "눌러서 보기" UI 는 iframe 문서 내부에 포함되어 내려오므로 부모는 추가하지 않는다.
 * 스크롤바는 iframe 문서가 overflow:hidden 으로 제어한다.
 *
 * ★ 비활성 슬라이드는 iframe 을 아예 마운트하지 않는다.
 * sandbox 에 allow-same-origin 이 없어 부모가 자식의 speechSynthesis 에 손대지 못한다.
 * 그래서 다음 슬라이드로 넘어갔을 때 이전 iframe 이 남아 있으면 그 발화가 계속 울린다.
 * teardown(pagehide) 을 통해 멈추게 해도 되지만 — 문서를 없애는 편이 확실하고,
 * 슬라이드마다 상태가 새지 않는다. 보이는 건 활성화된 한 장뿐이라 화면 변화도 없다.
 */
export function ShortEmbed({ html, title, active = true }: Props) {
  if (!html || !active) return null;

  return (
    <div className="embed">
      <iframe
        className="embed__frame"
        title={title}
        sandbox={EMBED_SANDBOX}
        srcDoc={withLifecycle(html)}
        allow={EMBED_ALLOW}
      />
    </div>
  );
}
