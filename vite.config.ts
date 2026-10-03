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
  },
})
