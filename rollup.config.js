import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

const production = !process.env.ROLLUP_WATCH;

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      production && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: ['react', 'react-dom', 'cross-fetch']
  },
  
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: false,
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      production && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: ['react', 'react-dom', 'cross-fetch']
  },

  // React hooks ESM build
  {
    input: 'src/react/index.ts',
    output: {
      file: 'dist/react.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      production && terser()
    ].filter(Boolean),
    external: ['react', 'react-dom', 'cross-fetch']
  },

  // React hooks CommonJS build
  {
    input: 'src/react/index.ts',
    output: {
      file: 'dist/react.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: false,
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      production && terser()
    ].filter(Boolean),
    external: ['react', 'react-dom', 'cross-fetch']
  }
]);