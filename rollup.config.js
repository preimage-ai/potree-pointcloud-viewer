// rollup.config.js  (CommonJS version)
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/Potree.js',
  output: {
    file: 'build/potree/potree.js',
    format: 'esm',            // keep your app bundle as ESM
    sourcemap: true,
  },
  // If THREE is loaded via <script> and should be external, uncomment:
  // external: ['three'],
  plugins: [
    // Find dependencies in node_modules and local libs
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.cjs'],
      preferBuiltins: false,
    }),

    // Convert any CJS deps to ESM for Rollup
    commonjs({
      include: [/node_modules\/.*/, 'libs/**'],
      transformMixedEsModules: true,
      defaultIsModuleExports: true,
    }),

    // Transpile modern syntax in your app *and* libs/gsplat/**
    babel({
      babelHelpers: 'bundled',
      extensions: ['.mjs', '.js', '.cjs'],
      include: [
        'src/**',
        'libs/**', // includes libs/gsplat/** builds you import
      ],
      presets: [
        ['@babel/preset-env', {
          targets: '>0.5%, not dead',
          bugfixes: true,
          modules: false,
        }],
      ],
      // Force-transform features that previously broke your build
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ['@babel/plugin-transform-optional-chaining', { loose: true }],
        ['@babel/plugin-transform-nullish-coalescing-operator', { loose: true }],
      ],
    }),

    // Optional: minify final bundle
    // terser(),
  ],
};
