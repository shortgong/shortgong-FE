import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { exchangeKey, getAccessToken } from '../api/client';
import { OAUTH_GOOGLE_URL } from '../api/config';
import { primeMe, useLogout, useMe } from '../api/queries';
import { AuthCtx } from './authContext';
import type { AuthStatus, AuthValue } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  /* accessToken 이 localStorage 에 있으므로 부팅 시 재발급 절차가 필요 없다.
     쿠키 재발급은 401 이 났을 때 client.ts 가 알아서 한 번 끼어든다. */
  const me = useMe();
  const logout = useLogout();

  const hasToken = !!getAccessToken();
  const status: AuthStatus = !hasToken ? 'anon' : me.isPending ? 'booting' : me.data ? 'authed' : 'anon';
  const user = me.data ?? null;

  const signIn = useCallback(() => {
    window.location.assign(OAUTH_GOOGLE_URL);
  }, []);

  const signOut = useCallback(() => {
    logout.mutate();
  }, [logout]);

  const adopt = useCallback(async (key: string) => {
    await exchangeKey(key);
    /* 회원을 미리 캐시에 넣으면 useMe 가 재사용해서 refetch 없이 authed 가 된다 */
    await primeMe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user, signIn, signOut, adopt }),
    [status, user, signIn, signOut, adopt],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}