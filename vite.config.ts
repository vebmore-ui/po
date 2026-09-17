import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Vanta's bundle reaches for `window.THREE` at load time, and both packages
    // are pulled in by a DYNAMIC import inside the About section. Vite discovers
    // deps by crawling static imports at server start, so without this it misses
    // them and serves a stale dep URL — which fails as an "Outdated Optimize Dep"
    // 504 the first time the section is reached, leaving the plate empty.
    include: ['three', 'vanta/dist/vanta.birds.min.js'],
  },
})
