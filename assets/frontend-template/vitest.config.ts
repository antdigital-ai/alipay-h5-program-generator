import { defineConfig } from 'vitest/config';
import path from 'node:path';
// 依赖：vitest + jsdom + @testing-library/react (devDependencies)
export default defineConfig({
  test: { environment: 'jsdom', globals: true, setupFiles: [] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
