import { EMBED_ALLOW, EMBED_SANDBOX } from "../embed/embedPolicy";
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
 */
export function ShortEmbed({ html, title }: Props) {
  if (!html) return null;

  return (
    <div className="embed">
      <iframe
        className="embed__frame"
        title={title}
        sandbox={EMBED_SANDBOX}
        srcDoc={html}
        allow={EMBED_ALLOW}
      />
    </div>
  );
}
