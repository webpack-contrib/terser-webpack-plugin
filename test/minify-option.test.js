import TerserPlugin from '../src';

import {
  cleanErrorStack,
  compile,
  createCompiler,
  normalizeSourceMap,
} from './helpers';

// Based on https://github.com/facebook/jest/blob/edde20f75665c2b1e3c8937f758902b5cf28a7b4/packages/jest-runner/src/__tests__/test_runner.test.js

jest.mock('worker-farm', () => {
  const mock = jest.fn((options, worker) =>
    jest.fn((data, callback) =>
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(worker)(data, callback)
    )
  );
  mock.end = jest.fn();
  return mock;
});

describe('when applied with `minify` option', () => {
  it('matches snapshot for `uglify-js` minifier', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        path: `${__dirname}/dist-uglify-js`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require('uglify-js').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `uglify-js` minifier while extracting comments', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es5.js`,
      output: {
        path: `${__dirname}/dist-uglify-js`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      extractComments: true,
      minify(file) {
        // eslint-disable-next-line global-require
        return require('uglify-js').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify(file) {
        // eslint-disable-next-line global-require
        return require('terser').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        });
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier and `sourceMap` is `true`', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      sourceMap: true,
      minify(file, sourceMap) {
        const terserOption = {
          mangle: {
            reserved: ['baz'],
          },
        };

        if (sourceMap) {
          terserOption.sourceMap = {
            content: sourceMap,
          };
        }

        // eslint-disable-next-line global-require
        return require('terser').minify(file, terserOption);
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(
            normalizeSourceMap(stats.compilation.assets[file].sourceAndMap())
          ).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `terser` minifier and `parallel` is `true`', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: true,
      minify: (file) =>
        // eslint-disable-next-line global-require
        require('terser').minify(file, {
          mangle: {
            reserved: ['baz'],
          },
        }),
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for errors into `minify` option', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      minify() {
        throw Error('Error');
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for errors into `minify` option and `parallel` is `true`', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/es6.js`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new TerserPlugin({
      parallel: true,
      minify: () => {
        throw Error('Error');
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });
});
