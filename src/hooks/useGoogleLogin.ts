import { useCallback, useState } from 'react';
import { OAUTH_GOOGLE_URL } from '../api/config';

const STEP_LABELS = ['Google로 이동 중'];

export const LOGIN_STEP_LABELS = STEP_LABELS;

const CONSENT_KEY = 'shortgong.consent';

/**
 * Google 로그인을 시작한다.
 *
 * Google 은 iframe 이나 XHR 에서 로그인 창을 띄우는 걸 막는다. 그래서 인증은
 * 브라우저 통째 이동으로만 한다 — 백엔드 /oauth2/authorization/google 로 가면
 * 거기서 인증하고, 백엔드가 OAuth 코드를 받은 뒤 교환 토큰을 붙여 이 앱의
 * /oauth/callback 으로 돌려보낸다. accessToken 은 그 콜백이 받아 세운다.
 *
 * 동의 체크는 이동을 넘어 살아남아야 하므로 sessionStorage 에 남긴다.
 */
export function useGoogleLogin() {
  const [agreed, setAgreed] = useState(() => sessionStorage.getItem(CONSENT_KEY) === '1');
  const [loading, setLoading] = useState(false);
  const [step] = useState(0);

  const login = useCallback(() => {
    if (!agreed || loading) return;
    sessionStorage.setItem(CONSENT_KEY, '1');
    setLoading(true);
    window.location.assign(OAUTH_GOOGLE_URL);
  }, [agreed, loading]);

  return { agreed, setAgreed, loading, step, login };
}