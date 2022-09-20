import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import json from '@rollup/plugin-json';

export default [{
  input: 'src/index.js',
  output: {
    name: 'ParticleLaunch',
    file: 'index.es.js',
    format: 'es',
    sourcemap: true,
    globals: {
      karas: 'karas',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'ParticleLaunch',
    file: 'index.js',
    format: 'umd',
    sourcemap: true,
    globals: {
      karas: 'karas',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'ParticleLaunch',
    file: 'index.es.js',
    format: 'es',
    sourcemap: true,
    globals: {
      karas: 'karas',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'ParticleLaunch',
    file: 'index.min.js',
    format: 'umd',
    sourcemap: true,
    globals: {
      karas: 'karas',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    uglify({
      sourcemap: true,
    }),
    json(),
  ],
}];
