import { API_BASE, ENDPOINTS } from './config';

/**
 * 백엔드 호출 계층.
 *
 * 토큰 배치 — accessToken 은 localStorage 에 둔다:
 *   · 새로고침·탭 전환에도 로그인이 유지돼서, 부팅 때마다 재로그인시키지 않는다
 *   · 대신 페이지를 읽을 수 있는 스크립트(XSS)에게 토큰이 노출된다 — 읽은 뒤 어디로
 *     보낼지 통제할 수 없다는 점이 localStorage 의 대가다
 *   · 그래도 refreshToken 은 자기가 저장하지 않는다 — 백엔드가 HttpOnly cookie 로
 *     내려주고, FE 는 credentials: 'include' 로 실어 보내기만 한다
 *   · accessToken 이 죽었으면 401 → refresh 한 번 후 재시도한다
 */
export type Member = {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  profileImageUrl: string | null;
};

type ErrorBody = { status: number; code: string; message: string; timestamp?: string };
type Envelope<T> = { success: boolean; data: T | null; error: ErrorBody | null };

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const ACCESS_KEY = 'shortgong.accessToken';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}

async function request(path: string, init: RequestInit): Promise<Response> {
  return fetch(API_BASE + path, {
    ...init,
    /* refreshToken 쿠키를 위해 필수 — 이게 없으면 refresh/로그아웃이 조용히 실패한다 */
    credentials: 'include',
    headers: { ...(init.headers as Record<string, string> | undefined) },
  });
}

async function unwrap<T>(res: Response): Promise<T> {
  let env: Envelope<T>;
  try {
    env = await res.json();
  } catch {
    throw new ApiError(res.status, 'BAD_RESPONSE', `응답을 읽지 못했습니다 (${res.status})`);
  }
  if (res.ok && env.success && env.data !== null) return env.data;
  throw new ApiError(
    env.error?.status ?? res.status,
    env.error?.code ?? 'UNKNOWN',
    env.error?.message ?? res.statusText,
  );
}

/** 401 을 한 번만 되살린다 — 재발급이 겹쳐 돌면 refreshToken 이rotation 되는 백엔드에서 위험하다 */
let refreshing: Promise<string | null> | null = null;

/**
 * accessToken 재발급.
 *
 * 실패하면 토큰을 지운다 — 죽은 토큰을 계속 들고 있으면 이후 모든 요청이 401 이고,
 * "로그인 안 된 사람" 과 "세션이 죽은 사람" 을 구분할 수 없게 된다.
 */
function refresh(): Promise<string | null> {
  refreshing ??= request(ENDPOINTS.refresh, { method: 'POST' })
    .then((res) => unwrap<{ accessToken: string }>(res))
    .then((data) => {
      setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * API 호출 진입점.
 *
 * accessToken 이 있으면 Bearer 로 붙이고, 401 이면 refresh 한 번 후 재시도한다.
 * 그래도 실패하면 ApiError 를 던진다 — 호출한 화면이 로그인 화면으로 유도한다.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...rest } = init;

  const send = () => {
    const token = getAccessToken();
    return request(path, {
      ...rest,
      headers: {
        ...(rest.headers as Record<string, string> | undefined),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  const res = await send();
  if (res.status !== 401 || !auth) return unwrap<T>(res);

  const token = await refresh();
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
  return unwrap<T>(await send());
}

/** 로그인 직후 — 콜백이 넘겨받은 교환 토큰을 accessToken 으로 바꾼다 (1회 사용) */
export function exchangeKey(key: string) {
  const qs = new URLSearchParams({ token: key });
  return request(`${ENDPOINTS.exchange}?${qs}`, { method: 'GET' })
    .then((res) => unwrap<{ accessToken: string }>(res))
    .then((data) => {
      setAccessToken(data.accessToken);
      return data.accessToken;
    });
}

export function fetchMe() {
  return apiFetch<Member>(ENDPOINTS.me);
}

export async function logout() {
  try {
    await request(ENDPOINTS.logout, { method: 'DELETE' });
  } finally {
    setAccessToken(null);
  }
}