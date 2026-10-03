/**
 * 백엔드 연결 설정.
 *
 * 개발 중 FE 를 http://localhost:5199 으로 연다. API 는 http://localhost:8080 을
 * 직접 때린다 — 프록시 없음. 두 출처는 같은 사이트(site)다 — 포트는 사이트 계산에서
 * 제외되므로 refreshToken 쿠키(SameSite=Lax)가 XHR 에도 붙는다. 127.0.0.1 로 열면
 * 다른 사이트가 되어 쿠키가 막히므로 localhost 로 고정한다.
 */
/**
 * 백엔드 원본 주소.
 *
 * API_BASE 과 분리한다. XHR 은 VITE_API_BASE='' 로 프록시에 넘길 수 있지만,
 * OAuth 는 location 이동이라 반드시 절대 주소여야 한다 — 상대경로가 되면
 * SPA 로 넘어와 라우팅에 안 맞아 화면이 아무 데도 못 간다.
 */
export const AUTH_ORIGIN = import.meta.env.VITE_AUTH_ORIGIN ?? 'http://localhost:8080';

/** XHR 대상 — 8080 을 직접 때린다. 프록시를 쓰지 않는다 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? AUTH_ORIGIN;

/** OAuth 시작점 — 여기로 통째로 이동한다 (백엔드가 Google 과 state/PKCE 를 다룬다) */
export const OAUTH_GOOGLE_URL = `${AUTH_ORIGIN}/oauth2/authorization/google`;

/** FE 콜백 경로 — 백엔드가 로그인 후 여기로 ?key=<교환 토큰> 을 붙여 보낸다 */
export const CALLBACK_PATH = '/oauth/callback';

export const ENDPOINTS = {
  exchange: '/api/auth/token/exchange',
  refresh: '/api/auth/token/refresh',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
} as const;