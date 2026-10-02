import { API_BASE, ENDPOINTS } from './config';

/**
 * 백엔드 호출 계층.
 *
 * 토큰 배치 — accessToken 은 메모리에만 둔다:
 *   · localStorage 에 두면 XSS 에 그대로 노출되고, 읽은 뒤 어디로 보낼지 통제할 수 없다
 *   · 대신 새로고침되면 accessToken 이 사라지므로, 부팅할 때 refreshToken 쿠키로 재발급한다
 *     (POST /api/auth/token/refresh). 쿠키는 HttpOnly 라 JS 가 건드릴 수 없다.
 *   · refreshToken 을 자기가 저장하는 일은 없다 — 백엔드가 Set-Cookie 로 내려준다.
 *     FE 는 credentials: 'include' 로 실어 보내기만 한다.
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

let accessToken: string | null = null;

/**
 * '한 번이라도 로그인했는가' 표시.
 *
 * refreshToken 은 HttpOnly 라 JS 가 볼 수 없다. 그래서 이 표지만 보고 부팅 시
 * 재발급을 시도한다 — 표지가 없으면 백엔드에 아예 묻지 않는다. 안 그러면 손님이
 * 매 페이지 로드마다 403 을 받고 그게 콘솔에 그대로 남는다.
 * 로그인 성공·로그아웃·실패 때 함께 지운다.
 */
const SESSION_KEY = 'shortgong.session';

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const hasSessionHint = () => localStorage.getItem(SESSION_KEY) === '1';

function markSession(on: boolean) {
  if (on) localStorage.setItem(SESSION_KEY, '1');
  else localStorage.removeItem(SESSION_KEY);
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
 * 표지를 먼저 걸어둔다 — 성공하면 세션이 살아 있다는 뜻이니 다음 부팅 때 다시 물어봐야 하고,
 * 실패하면 표지를 지워 '한 번도 안 로그인한 사람' 처럼 되돌린다 (그렇지 않으면 매 로드마다 재시도한다).
 */
function refresh(): Promise<string | null> {
  markSession(true);
  refreshing ??= request(ENDPOINTS.refresh, { method: 'POST' })
    .then((res) => unwrap<{ accessToken: string }>(res))
    .then((data) => {
      setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .catch(() => {
      markSession(false);
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

  const send = () =>
    request(path, {
      ...rest,
      headers: {
        ...(rest.headers as Record<string, string> | undefined),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

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
      markSession(true);
      return data.accessToken;
    });
}

/** 표지가 있을 때만 쿠키로 세션을 되살린다 — 새로고침 후 로그인이 유지되는 경로 */
export async function restoreSession(): Promise<Member | null> {
  if (!hasSessionHint()) return null;
  if (!(await refresh())) return null;
  try {
    return await fetchMe();
  } catch {
    /* accessToken 이 살아도 세션은 죽었을 수 있다 — 표지를 지워 다음 부팅을 아껴 둔다 */
    markSession(false);
    setAccessToken(null);
    return null;
  }
}

export function fetchMe() {
  return apiFetch<Member>(ENDPOINTS.me);
}

export async function logout() {
  try {
    await request(ENDPOINTS.logout, { method: 'DELETE' });
  } finally {
    markSession(false);
    setAccessToken(null);
  }
}