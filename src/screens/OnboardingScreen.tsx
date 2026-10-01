import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMark } from '../components/GoogleMark';
import { ONBOARDING_PAGES } from '../data/onboarding';
import { LOGIN_STEP_LABELS, useGoogleLogin } from '../hooks/useGoogleLogin';
import { useSwipeDeck } from '../hooks/useSwipeDeck';
import './OnboardingScreen.css';

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { agreed, setAgreed, loading, step, login } = useGoogleLogin(() => navigate('/home'));
  const deck = useSwipeDeck({
    count: ONBOARDING_PAGES.length,
    index: page,
    onIndex: setPage,
    enabled: !loading,
  });

  return (
    <div className="screen ob">
      <header className="ob__head">
        <span className="ob__wordmark">숏공</span>
      </header>

      <div className="ob__viewport" {...deck.bind}>
        <div
          className={`ob__track ${deck.dragging ? 'is-dragging' : ''}`}
          style={{ transform: `translate3d(calc(${-page * 100}% + ${deck.dx}px), 0, 0)` }}
        >
          {ONBOARDING_PAGES.map((item, i) => (
            <section
              key={i}
              className={`ob__slide ${i === page ? 'is-active' : ''}`}
              aria-hidden={i !== page}
            >
              <h1 className="ob__title">
                {item.lines.map((l, n) => (
                  <span key={l} className={`ob__line ${n === 1 ? 'ob__line--accent' : ''}`}>
                    {l}
                  </span>
                ))}
              </h1>

              <p className="ob__desc">
                {item.desc.map((l) => (
                  <span key={l} className="ob__descLine">
                    {l}
                  </span>
                ))}
              </p>

              <div className="ob__artWrap">
                <img className="ob__art" src={item.image} alt="" decoding="async" />
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="ob__foot">
        <div className="ob__dots" role="tablist" aria-label="온보딩 페이지" onKeyDown={deck.onKeyDown}>
          {ONBOARDING_PAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`${i + 1}번째 페이지`}
              className={`ob__dot ${i === page ? 'is-on' : ''}`}
              onClick={() => deck.go(i)}
            />
          ))}
        </div>

        {/* 페이지를 끝까지 넘기지 않아도 바로 로그인된다 */}
        <button type="button" className="ob__cta" onClick={login} disabled={!agreed || loading}>
          {loading ? (
            <>
              <span className="ob__spin" aria-hidden="true" />
              <span className="ob__ctaLabel" role="status" aria-live="polite">
                {LOGIN_STEP_LABELS[step]}
              </span>
            </>
          ) : (
            <>
              <GoogleMark size={20} />
              <span className="ob__ctaLabel">Google로 시작하기</span>
            </>
          )}
        </button>

        <div className="ob__consent">
          {/* 링크를 label에 넣으면 체크 누르기가 링크 이동으로 새므로 분리한다 */}
          <label className="ob__checkHit" htmlFor="ob-consent">
            <input
              id="ob-consent"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="ob__checkMark" aria-hidden="true" />
          </label>
          <p className="ob__consentText">
            <button type="button" className="ob__link" onClick={() => navigate('/legal/terms')}>
              이용약관
            </button>
            과{' '}
            <button type="button" className="ob__link" onClick={() => navigate('/legal/privacy')}>
              개인정보처리방침
            </button>
            에 동의합니다
          </p>
        </div>
      </footer>
    </div>
  );
}
