// vite.config.ts
import { defineConfig } from "file:///Users/thekevinscott/code/codegen/repositories/contortionist/node_modules/.pnpm/vitest@1.4.0_@types+node@20.12.4_terser@5.30.3/node_modules/vitest/dist/config.js";
import { externalizeDeps } from "file:///Users/thekevinscott/code/codegen/repositories/contortionist/node_modules/.pnpm/vite-plugin-externalize-deps@0.8.0_vite@5.1.5_@types+node@20.12.4_terser@5.30.3_/node_modules/vite-plugin-externalize-deps/dist/index.js";
import dts from "file:///Users/thekevinscott/code/codegen/repositories/contortionist/node_modules/.pnpm/vite-plugin-dts@3.7.3_@types+node@20.12.4_rollup@4.12.1_typescript@5.4.2_vite@5.1.5_@types+node@20.12.4_terser@5.30.3_/node_modules/vite-plugin-dts/dist/index.mjs";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es", "umd"],
      name: "Contortionist"
    },
    sourcemap: true,
    target: "esnext",
    minify: true
  },
  plugins: [
    externalizeDeps({
      except: [
        "gbnf"
      ]
    }),
    dts()
  ],
  test: {
    coverage: {
      provider: "v8"
    },
    include: ["**/*.test.ts"],
    globals: true,
    typecheck: {
      tsconfig: "./tsconfig.test.json"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGhla2V2aW5zY290dC9jb2RlL2NvZGVnZW4vcmVwb3NpdG9yaWVzL2NvbnRvcnRpb25pc3QvcGFja2FnZXMvY29udG9ydFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3RoZWtldmluc2NvdHQvY29kZS9jb2RlZ2VuL3JlcG9zaXRvcmllcy9jb250b3J0aW9uaXN0L3BhY2thZ2VzL2NvbnRvcnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3RoZWtldmluc2NvdHQvY29kZS9jb2RlZ2VuL3JlcG9zaXRvcmllcy9jb250b3J0aW9uaXN0L3BhY2thZ2VzL2NvbnRvcnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyBleHRlcm5hbGl6ZURlcHMsIH0gZnJvbSAndml0ZS1wbHVnaW4tZXh0ZXJuYWxpemUtZGVwcyc7XG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogJ3NyYy9pbmRleC50cycsXG4gICAgICBmaWxlTmFtZTogJ2luZGV4JyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJyxdLFxuICAgICAgbmFtZTogJ0NvbnRvcnRpb25pc3QnLFxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgbWluaWZ5OiB0cnVlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgZXh0ZXJuYWxpemVEZXBzKHtcbiAgICAgIGV4Y2VwdDogW1xuICAgICAgICAnZ2JuZicsXG4gICAgICBdLFxuICAgIH0pLFxuICAgIGR0cygpLFxuICBdLFxuICB0ZXN0OiB7XG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxuICAgIH0sXG4gICAgaW5jbHVkZTogWycqKi8qLnRlc3QudHMnLF0sXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICB0eXBlY2hlY2s6IHtcbiAgICAgIHRzY29uZmlnOiAnLi90c2NvbmZpZy50ZXN0Lmpzb24nLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVosU0FBUyxvQkFBcUI7QUFDdmIsU0FBUyx1QkFBd0I7QUFDakMsT0FBTyxTQUFTO0FBRWhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLFVBQVU7QUFBQSxNQUNWLFNBQVMsQ0FBQyxNQUFNLEtBQU07QUFBQSxNQUN0QixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ047QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsRUFDTjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osVUFBVTtBQUFBLE1BQ1IsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLFNBQVMsQ0FBQyxjQUFlO0FBQUEsSUFDekIsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLE1BQ1QsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
