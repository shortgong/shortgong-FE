import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { CALLBACK_PATH } from '../api/config';
import { useAuth } from '../store/authContext';
import './OAuthCallbackScreen.css';

const DENIED = 'Google 로그인이 마무리되지 않았어요. 다시 시도해 주세요.';
const NO_KEY = '교환 키가 넘어오지 않았어요. 백엔드의 로그인 결과 주소부터 확인해 주세요.';

function describe(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === 'NOT_FOUND_EXCHANGE_TOKEN') return '교환 키를 찾을 수 없어요. 이미 썼거나 오래된 키예요.';
    if (e.status === 401 || e.status === 403) return DENIED;
    return e.message;
  }
  return '로그인을 마치지 못했어요. 네트워크를 확인해 주세요.';
}

export function OAuthCallbackScreen() {
  const [params] = useSearchParams();
  const { adopt } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState<string | null>(null);
  const started = useRef(false);

  const key = params.get('key');
  /* 되돌아오지 못한 사유는 렌더 중에 정해진다 — effect 안에서 setState 로 만들 이유가 없다 */
  const blocked = params.get('error') ? DENIED : key ? null : NO_KEY;
  const error = blocked ?? failed;

  useEffect(() => {
    /* StrictMode 로 두 번 마운트돼도 교환은 한 번만 — 키가 1회용이라 두 번째는 무조건 실패한다 */
    if (started.current || !key || blocked) return;
    started.current = true;

    /* 키는 1회용이라 되돌려 보낼 수 없다 — 성공/실패와 무관하게 주소창에서 치운다 */
    window.history.replaceState(null, '', CALLBACK_PATH);

    adopt(key)
      .then(() => navigate('/home', { replace: true }))
      .catch((e: unknown) => setFailed(describe(e)));
  }, [adopt, blocked, key, navigate]);

  return (
    <div className="screen cb">
      <div className="cb__panel">
        {error ? (
          <>
            <h1 className="cb__title t-title">로그인에 실패했어요</h1>
            <p className="cb__text t-body muted">{error}</p>
            <button type="button" className="cb__btn" onClick={() => navigate('/onboarding')}>
              다시 로그인
            </button>
          </>
        ) : (
          <>
            <span className="cb__spin" aria-hidden="true" />
            <h1 className="cb__title t-title">로그인 마무리 중</h1>
            <p className="cb__text t-body muted" role="status" aria-live="polite">
              잠시만 기다려 주세요
            </p>
          </>
        )}
      </div>
    </div>
  );
}