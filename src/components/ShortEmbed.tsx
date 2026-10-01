import { useEffect } from 'react';
import { EMBED_ALLOW, EMBED_SANDBOX } from '../embed/embedPolicy';
import { useEmbedInteraction } from '../hooks/useEmbedInteraction';
import { Icon } from './Icon';
import './ShortEmbed.css';

type Props = {
  id: string;
  html?: string;
  tone: string;
  title: string;
  /** 이 쇼츠가 현재 보이는 슬라이드인지. false 가 되면 상호작용 모드가 닫힌다 */
  active: boolean;
};

/**
 * 쇼츠 본문 임베드.
 *
 * html 이 없으면 렌더링하지 않는다 — 그 쇼츠는 배경 그라디언트만 보여준다.
 * html 은 인제스트가 새티타이즈하고 CSP 를 주입해 내려준 self-contained 문서다.
 * 프론트는 sandbox 토큰만 지정하고, 그 밖의 새티타이징은 하지 않는다.
 */
export function ShortEmbed({ id, html, tone, title, active }: Props) {
  const { open, close, isLive } = useEmbedInteraction();
  const live = isLive(id);

  /* 다른 쇼츠로 넘어가면 닫는다 — 다음 쇼츠는 새 터치 제스처로 시작돼야 한다 */
  useEffect(() => {
    if (!active) close();
  }, [active, close]);

  if (!html) return null;

  return (
    <div className={`embed ${live ? 'is-live' : ''}`} data-embed-id={id}>
      {live ? (
        <>
          <iframe
            className="embed__frame"
            title={title}
            sandbox={EMBED_SANDBOX}
            srcDoc={html}
            allow={EMBED_ALLOW}
          />
          <button type="button" className="embed__exit" onClick={close} aria-label="임베드 닫기">
            <Icon name="close" size={14} />
          </button>
        </>
      ) : (
        <button type="button" className="embed__play" onClick={() => open(id)} aria-label={`${title} 재생`}>
          <span className={`embed__dot embed__dot--${tone}`} aria-hidden="true">
            <Icon name="play" size={22} />
          </span>
          <span className="embed__playText t-caption-plain">눌러서 보기</span>
        </button>
      )}
    </div>
  );
}
