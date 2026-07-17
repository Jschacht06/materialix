import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

// Strict CSP for production builds: scripts/styles only from our own origin,
// images only from us and the icon CDN, no network calls, no embedding.
// Injected at build time only so it never interferes with Vite dev HMR.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://mc.nerothe.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

function injectCsp(): PluginOption {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works at any URL, including GitHub
  // Pages project sites like https://<user>.github.io/materialix/
  base: './',
  plugins: [react(), injectCsp()],
})
