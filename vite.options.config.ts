import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/options-app'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, '.options-dist'),
    emptyOutDir: true,
    sourcemap: true,
  },
});
