import { createContext, useContext } from 'react';
import type { Member } from '../api/client';

export type AuthStatus = 'booting' | 'anon' | 'authed';

export type AuthValue = {
  status: AuthStatus;
  user: Member | null;
  /** 백엔드 OAuth 로 통째로 이동 — Google 이 iframe/XHR 을 막으므로 리다이렉트뿐이다 */
  signIn: () => void;
  signOut: () => void;
  /** 콜백이 교환 토큰으로 accessToken 을 얻은 뒤 호출 */
  adopt: (key: string) => Promise<void>;
};

export const AuthCtx = createContext<AuthValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}