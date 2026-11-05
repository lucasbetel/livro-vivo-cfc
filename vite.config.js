import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera um único index.html (abre com dois cliques, sem internet).
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { assetsInlineLimit: 100000000, chunkSizeWarningLimit: 5000 },
});
