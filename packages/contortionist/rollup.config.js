import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { string } from "rollup-plugin-string";

// import esbuild from 'rollup-plugin-esbuild';

const stringConfig = string({
  // Required to be specified
  include: "**/*.py",

  // Undefined by default
  // exclude: ["**/index.html"]
});

export default [
  // {
  //   input: `src/index.ts`,
  //   plugins: [stringConfig, typescript()],

  //   output: [
  //     {
  //       file: `dist/coder.cjs`,
  //       format: 'cjs',
  //       sourcemap: true,
  //       exports: 'default',
  //     },
  //   ]
  // },
  {
    input: `src/index.ts`,
    plugins: [stringConfig, typescript(),],
    output: [
      {
        file: `./dist/index.js`,
        format: 'esm',
        sourcemap: true,
        exports: 'default',
      },
    ]
  },
  // {
  //   input: `src/index.ts`,
  //   plugins: [dts()],
  //   output: {
  //     file: `dist/coder.d.ts`,
  //     format: 'es',
  //   },
  // }
]
