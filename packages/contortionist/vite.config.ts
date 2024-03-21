import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'umd'],
      name: 'Contortionist',
    }
  },
  plugins: [dts()],
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    }
  },
})
