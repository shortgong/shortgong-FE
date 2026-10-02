import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { exchangeKey, fetchMe, logout, restoreSession } from '../api/client';
import type { Member } from '../api/client';
import { OAUTH_GOOGLE_URL } from '../api/config';
import { AuthCtx } from './authContext';
import type { AuthStatus, AuthValue } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [user, setUser] = useState<Member | null>(null);

  /* 부팅 시 표지가 있으면 refreshToken 쿠키로 세션을 되살린다 (accessToken 은 메모리라 필수) */
  useEffect(() => {
    let alive = true;
    restoreSession()
      .then((me) => {
        if (!alive) return;
        setUser(me);
        setStatus(me ? 'authed' : 'anon');
      })
      .catch(() => alive && setStatus('anon'));
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(() => {
    window.location.assign(OAUTH_GOOGLE_URL);
  }, []);

  const signOut = useCallback(() => {
    logout()
      .catch(() => undefined)
      .finally(() => {
        setUser(null);
        setStatus('anon');
      });
  }, []);

  const adopt = useCallback(async (key: string) => {
    await exchangeKey(key);
    setUser(await fetchMe());
    setStatus('authed');
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user, signIn, signOut, adopt }),
    [status, user, signIn, signOut, adopt],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}