import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    testTimeout: 10000,
    hookTimeout: 20000,
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
      tsconfig: './tests/tsconfig.json'
    },
    setupFiles: [
      path.resolve(__dirname, './test/setup/index.ts'),
    ]
  },
});
