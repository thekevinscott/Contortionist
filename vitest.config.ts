import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    testTimeout: 1000,
    hookTimeout: 10000,
    include: [
      'test/tests/**/*.test.ts',
      'src/packages/contortionist/**/*.ts',
    ],
    exclude: [
      // 'packages/**/*.test.*',
    ],
    watchExclude: [
      'tmp/**/*',
    ],
    globals: true,
    typecheck: {
      tsconfig: './tsconfig.vitest.json'
    },
    setupFiles: [
      path.resolve(__dirname, './test/setup/index.ts'),
    ]
  },
});
