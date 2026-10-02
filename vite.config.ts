import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /* 반드시 localhost 로 연다 — 백엔드(localhost:8080)와 같은 사이트여야
       refreshToken 쿠키(SameSite=Lax)가 XHR 에 붙는다. 127.0.0.1 로 열면
       다른 사이트로 판정돼 쿠키가 전부 막힌다. */
    host: 'localhost',
    port: 5199,
    /* OAuth 는 출처가 고정돼야 한다 — 다른 포트로 조용히 밀리면 콜백 주소가 틀어진다 */
    strictPort: true,
    /* 백엔드에 CORS 를 못 심는 상황의 탈출구. VITE_API_BASE='' 로 두면 API 호출이
       상대 경로로 나가 여기서 8080 으로 전달된다 → 같은 출처라 CORS·쿠키 문제가 사라진다.
       OAuth 이동(OAUTH_GOOGLE_URL)은 어차피 절대 주소라 이 프록시를 타지 않는다. */
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
})
