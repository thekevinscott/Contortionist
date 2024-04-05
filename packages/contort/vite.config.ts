import { defineConfig, } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es', 'umd',],
      name: 'Contortionist',
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  plugins: [dts(),],
  test: {
    coverage: {
      provider: 'istanbul', // or 'v8'
    },
    include: ['**/*.test.ts',],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
