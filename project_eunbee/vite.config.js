import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/kma/vilage': {
        target: 'https://apihub.kma.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/kma\/vilage/, '/api/typ02/openApi')
      },
      '/api/kma': {
        target: 'https://apihub.kma.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/kma/, '/api/typ01/url')
      }
    }
  }
});
